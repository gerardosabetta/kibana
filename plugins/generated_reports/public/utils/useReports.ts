import { useQuery } from 'react-query';

type Report = any;

const fetchReports = async ({ pageSize, page }: { pageSize: number; page: number }) => {
  const response = await fetch(
    '/api/reporting/jobs/list?' + new URLSearchParams({ size: pageSize, page } as any),
    {
      method: 'GET',
    }
  );

  const countResponse = await fetch('/api/reporting/jobs/count', {
    method: 'GET',
  });
  const data = await response.json();
  const total = await countResponse.json();

  return {
    total,
    results: data,
  };
};

export const useReports = ({ pageSize, page }: { pageSize: number; page: number }) =>
  useQuery<{ total: number; results: Report[] }, Error>(
    ['reports', pageSize, page],
    () => fetchReports({ pageSize, page }),
    {
      refetchInterval: 5000,
    }
  );
