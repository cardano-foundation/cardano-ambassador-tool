import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { MemberData } from "@sidan-lab/cardano-ambassador-tool";
import type { Utxo } from "@types";
import type { RootState } from "../../store";

// ---------- Types ----------

export interface UserSession {
  address: string;
  roles: string[];
  timestamp: number;
}

export interface AuthState {
  // User state
  address: string | null;
  roles: string[];

  // Computed flags
  isAuthenticated: boolean;
  isAdmin: boolean;

  // Loading states
  isLoading: boolean;
  isHydrated: boolean;

  // Member validation
  isMember: boolean;
  memberValidationLoading: boolean;
  currentMemberData: MemberData | null;
  // Store the member UTxO reference (txHash:outputIndex) instead of full object
  currentMemberUtxoRef: string | null;

  // Error
  error: string | null;
}

// ---------- Initial State ----------

const initialState: AuthState = {
  address: null,
  roles: [],
  isAuthenticated: false,
  isAdmin: false,
  isLoading: false,
  isHydrated: false,
  isMember: false,
  memberValidationLoading: true,
  currentMemberData: null,
  currentMemberUtxoRef: null,
  error: null,
};

// ---------- Async Thunks ----------

/**
 * Hydrate auth state from localStorage session
 */
export const hydrateFromSession = createAsyncThunk<
  UserSession | null,
  void,
  { rejectValue: string; state: RootState }
>(
  "auth/hydrateFromSession",
  async (_, { rejectWithValue }) => {
    try {
      if (typeof window === "undefined") return null;

      const stored = localStorage.getItem("user_session");
      if (!stored) return null;

      const session = JSON.parse(stored) as UserSession & {
        roles: { role: string }[] | string[];
      };

      // Check if session is older than 24 hours
      const twentyFourHours = 24 * 60 * 60 * 1000;
      if (Date.now() - session.timestamp > twentyFourHours) {
        localStorage.removeItem("user_session");
        return null;
      }

      // Normalize roles format (could be string[] or {role: string}[])
      const roles = session.roles.map((r: string | { role: string }) =>
        typeof r === "string" ? r : r.role,
      );

      return {
        address: session.address,
        roles,
        timestamp: session.timestamp,
      };
    } catch (error) {
      localStorage.removeItem("user_session");
      return rejectWithValue("Failed to hydrate session");
    }
  },
  {
    // Many components mount useUserAuth simultaneously; without this guard
    // each one would dispatch hydration before isHydrated flips, causing
    // duplicate localStorage reads and state churn.
    condition: (_, { getState }) => !getState().auth.isHydrated,
  },
);

/**
 * Resolve user roles from server
 */
export const resolveUserRoles = createAsyncThunk<
  { address: string; roles: string[] },
  string,
  { rejectValue: string; state: RootState }
>(
  "auth/resolveUserRoles",
  async (address, { rejectWithValue }) => {
    try {
      // Import dynamically to avoid SSR issues with server action
      const { resolveRoles } = await import("@/lib/auth/roles");
      const roles = await resolveRoles(address);
      const roleStrings = roles.map((r) => r.role);

      // Create session in localStorage
      const sessionData = {
        address,
        roles: roleStrings,
        timestamp: Date.now(),
      };
      localStorage.setItem("user_session", JSON.stringify(sessionData));

      return { address, roles: roleStrings };
    } catch (error) {
      return rejectWithValue("Failed to resolve user roles");
    }
  },
  {
    // Many components call useUserAuth (AppInitializer, AuthGuard, SideNav,
    // TopNavBar, etc.). When the wallet auto-connects they all see
    // isAuthenticated=false on the same render and would each dispatch this
    // thunk, fanning out into dozens of duplicate `resolveRoles` server-action
    // POSTs. Skip if a request is already in-flight or this address is already
    // resolved.
    condition: (address, { getState }) => {
      const { auth } = getState();
      if (auth.isLoading) return false;
      if (auth.isAuthenticated && auth.address === address) return false;
      return true;
    },
  },
);

// ---------- Slice ----------

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * Set authentication state when wallet connects
     */
    setAuthenticated: (
      state,
      action: PayloadAction<{ address: string; roles: string[] }>,
    ) => {
      state.address = action.payload.address;
      state.roles = action.payload.roles;
      state.isAuthenticated = true;
      state.isAdmin = action.payload.roles.includes("admin");
      state.error = null;
    },

    /**
     * Clear authentication state on logout/disconnect
     */
    clearAuth: (state) => {
      state.address = null;
      state.roles = [];
      state.isAuthenticated = false;
      state.isAdmin = false;
      state.isMember = false;
      state.currentMemberData = null;
      state.currentMemberUtxoRef = null;
      state.error = null;
      // Don't reset isHydrated - that's a one-time initialization flag
      if (typeof window !== "undefined") {
        localStorage.removeItem("user_session");
      }
    },

    /**
     * Update member validation state
     */
    setMemberValidation: (
      state,
      action: PayloadAction<{
        isMember: boolean;
        memberData: MemberData | null;
        memberUtxoRef: string | null;
      }>,
    ) => {
      state.isMember = action.payload.isMember;
      state.currentMemberData = action.payload.memberData;
      state.currentMemberUtxoRef = action.payload.memberUtxoRef;
      state.memberValidationLoading = false;
    },

    /**
     * Set member validation loading state
     */
    setMemberValidationLoading: (state, action: PayloadAction<boolean>) => {
      state.memberValidationLoading = action.payload;
    },

    /**
     * Set auth loading state
     */
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    /**
     * Set auth error
     */
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Hydrate from session
    builder
      .addCase(hydrateFromSession.pending, (state) => {
        // Don't set isLoading for hydration - it's a background check
      })
      .addCase(hydrateFromSession.fulfilled, (state, action) => {
        state.isHydrated = true;
        if (action.payload) {
          state.address = action.payload.address;
          state.roles = action.payload.roles;
          state.isAuthenticated = true;
          state.isAdmin = action.payload.roles.includes("admin");
        }
      })
      .addCase(hydrateFromSession.rejected, (state) => {
        state.isHydrated = true;
        // Session invalid, but that's okay - user just needs to reconnect
      });

    // Resolve user roles
    builder
      .addCase(resolveUserRoles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resolveUserRoles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.address = action.payload.address;
        state.roles = action.payload.roles;
        state.isAuthenticated = true;
        state.isAdmin = action.payload.roles.includes("admin");
      })
      .addCase(resolveUserRoles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to resolve roles";
        state.isAuthenticated = false;
        state.isAdmin = false;
      });
  },
});

export const {
  setAuthenticated,
  clearAuth,
  setMemberValidation,
  setMemberValidationLoading,
  setAuthLoading,
  setAuthError,
} = authSlice.actions;

export default authSlice.reducer;
