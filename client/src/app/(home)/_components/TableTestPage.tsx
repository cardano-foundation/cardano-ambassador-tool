"use client";

import { ColumnDef, Table } from "@/components/Table/Table";
import { Ambassador } from "@types";

export function TableTestPage() {
  const getCountryFlag = (country: string) => {
    const flags: { [key: string]: string } = {
      Argentina: "🇦🇷",
      Romania: "🇷🇴",
      Indonesia: "🇮🇩",
      Norway: "🇳🇴",
      Ghana: "🇬🇭",
      Germany: "🇩🇪",
      DRC: "🇨🇩",
      Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
      "United States": "🇺🇸",
      Kazakhstan: "🇰🇿",
      Poland: "🇵🇱",
      Venezuela: "🇻🇪",
      Netherlands: "🇳🇱",
      Italy: "🇮🇹",
      Brazil: "🇧🇷",
      UAE: "🇦🇪",
      Singapore: "🇸🇬",
      France: "🇫🇷",
      Japan: "🇯🇵",
      Ireland: "🇮🇪",
      Spain: "🇪🇸",
      Nigeria: "🇳🇬",
      "United Kingdom": "🇬🇧",
      India: "🇮🇳",
      Sweden: "🇸🇪",
      "Czech Republic": "🇨🇿",
      Mexico: "🇲🇽",
      Russia: "🇷🇺",
      Canada: "🇨🇦",
      Morocco: "🇲🇦",
      "South Korea": "🇰🇷",
      Ukraine: "🇺🇦",
      Austria: "🇦🇹",
      Slovakia: "🇸🇰",
      China: "🇨🇳",
      "Hong Kong": "🇭🇰",
      Colombia: "🇨🇴",
      Egypt: "🇪🇬",
      "New Zealand": "🇳🇿",
      Tunisia: "🇹🇳",
      Australia: "🇦🇺",
    };
    return flags[country] || "🌍";
  };

  const columns: ColumnDef<Ambassador>[] = [
    {
      header: "#",
      accessor: "username",
      sortable: false,
      cell: (value: string) => (
        <span className="text-neutral font-normal">{value}</span>
      ),
    },
    {
      header: "Name",
      accessor: "name",
      sortable: true,
      copyable: true,
      cell: (value: string) => (
        <span className="text-neutral font-normal">{value}</span>
      ),
    },
    {
      header: "Country",
      accessor: "country",
      sortable: true,
      cell: (value: string) => (
        <div className="text-neutral flex items-center gap-2">
          <span className="text-xs">{getCountryFlag(value)}</span>
          <span>{value}</span>
        </div>
      ),
      getCopyText: (value: string) => value,
    },
    {
      header: "Bio",
      accessor: "bio_excerpt",
      sortable: false,
      cell: (value: string | null) => (
        <span className="text-neutral text-sm">{value || "-"}</span>
      ),
    },
    {
      header: "Join Date",
      accessor: "created_at",
      sortable: true,
      copyable: true,
      cell: (value: string) => (
        <span className="text-neutral text-sm">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
      getCopyText: (value: string) => new Date(value).toISOString(),
    },
    {
      header: "Topics Created",
      accessor: "summary",
      sortable: true,
      cell: (value: Ambassador["summary"]) => (
        <span className="text-neutral font-medium">
          {value.stats.topics_created.toLocaleString()}
        </span>
      ),
    },
    {
      header: "Profile",
      accessor: "href",
      copyable: true,
      truncate: 25,
      cell: (value: string) => {
        const truncated =
          value.length > 30
            ? `${value.slice(0, 15)}...${value.slice(-10)}`
            : value;
        return (
          <span className="text-neutral text-xs" title={value}>
            {truncated}
          </span>
        );
      },
    },
  ];

  const handleCopy = (text: string, column: string) => {};

  return (
    <div className="mx-auto max-w-7xl p-6">
      <Table
        data={[]}
        columns={columns}
        pageSize={10}
        searchable={true}
        onCopy={handleCopy}
      />
    </div>
  );
}
