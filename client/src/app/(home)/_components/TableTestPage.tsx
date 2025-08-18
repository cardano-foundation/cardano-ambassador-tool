'use client';

import { Table, ColumnDef } from '@/components/Table/Table';
import Button from '@/components/atoms/Button';
import { mockAmbassadors, Ambassador } from '@/data/mockAmbassadors';

export function TableTestPage() {
  const getCountryFlag = (country: string) => {
    const flags: { [key: string]: string } = {
      Argentina: '🇦🇷',
      Romania: '🇷🇴',
      Indonesia: '🇮🇩',
      Norway: '🇳🇴',
      Ghana: '🇬🇭',
      Germany: '🇩🇪',
      DRC: '🇨🇩',
      Scotland: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
      'United States': '🇺🇸',
      Kazakhstan: '🇰🇿',
      Poland: '🇵🇱',
      Venezuela: '🇻🇪',
      Netherlands: '🇳🇱',
      Italy: '🇮🇹',
      Brazil: '🇧🇷',
      UAE: '🇦🇪',
      Singapore: '🇸🇬',
      France: '🇫🇷',
      Japan: '🇯🇵',
      Ireland: '🇮🇪',
      Spain: '🇪🇸',
      Nigeria: '🇳🇬',
      'United Kingdom': '🇬🇧',
      India: '🇮🇳',
      Sweden: '🇸🇪',
      'Czech Republic': '🇨🇿',
      Mexico: '🇲🇽',
      Russia: '🇷🇺',
      Canada: '🇨🇦',
      Morocco: '🇲🇦',
      'South Korea': '🇰🇷',
      Ukraine: '🇺🇦',
      Austria: '🇦🇹',
      Slovakia: '🇸🇰',
      China: '🇨🇳',
      Colombia: '🇨🇴',
      Egypt: '🇪🇬',
      'New Zealand': '🇳🇿',
      Tunisia: '🇹🇳',
      Australia: '🇦🇺',
    };
    return flags[country] || '🌍';
  };

  const columns: ColumnDef<Ambassador>[] = [
    {
      header: 'ID',
      accessor: 'id',
      sortable: true,
    },
    {
      header: 'Name',
      accessor: 'name',
      sortable: true,
      copyable: true, 
      cell: (value: string) => (
        <span className="font-normal text-neutral">{value}</span>
      )
    },
    {
      header: 'Country',
      accessor: 'country',
      sortable: true,
      cell: (value: string) => (
        <div className="flex items-center text-neutral gap-2">
          <span className="text-xs">{getCountryFlag(value)}</span>
          <span>{value}</span>
        </div>
      ),
      getCopyText: (value: string) => value,
    },
    {
      header: 'Status',
      accessor: 'isFollowing',
      
      cell: (value: boolean) => (
        <Button
          variant={value ? 'secondary' : 'primary'}
          size="sm"
          className="pointer-events-none w-[80px]"
        >
          {value ? 'Following' : 'Follow'}
        </Button>
      )
    },
    {
      header: 'Join Date',
      accessor: 'joinDate',
      sortable: true,
      copyable: true, 
      cell: (value: string) => (
        <span className="text-sm text-neutral">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
      getCopyText: (value: string) => new Date(value).toISOString(),
    },
    {
      header: 'Contributions',
      accessor: 'contributions',
      sortable: true,
      cell: (value: number) => (
        <span className="font-medium text-neutral">{value.toLocaleString()}</span>
      )
    },
    {
      header: 'Tx Hash',
      accessor: 'transactionHash',
      copyable: true,
      truncate: 25, 
      cell: (value: string | undefined) => {
        if (!value) return <span className="text-neutral">-</span>;
        const truncated = value.length > 16 
          ? `${value.slice(0, 8)}...${value.slice(-4)}`
          : value;
        return (
          <span className="text-xs text-neutral" title={value}>
            {truncated}
          </span>
        );
      }
    },
  ];

  const handleCopy = (text: string, column: string) => {
    console.log(`Copied "${text}" from ${column} column`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">

      <Table 
        data={mockAmbassadors} 
        columns={columns} 
        pageSize={10}
        searchable={true}
        onCopy={handleCopy}
      />
    </div>
  );
}