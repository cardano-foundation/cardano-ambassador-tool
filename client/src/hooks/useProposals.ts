import { useAppSelector } from "@/lib/redux/hooks";
import {
  selectDetailedProposals,
  selectDbLoading,
  selectDbError,
} from "@/lib/redux/features/data/dataSelectors";

const useProposals = () => {
  const allProposals = useAppSelector(selectDetailedProposals);
  const loading = useAppSelector(selectDbLoading);
  const error = useAppSelector(selectDbError);

  return { allProposals, loading, error };
};

export default useProposals;
