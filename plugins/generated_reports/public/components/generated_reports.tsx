import React, { useState } from 'react';
import { EuiBasicTable, EuiIconTip, EuiBasicTableColumn } from '@elastic/eui';
import type { IconType } from '@elastic/eui';
import { useReports } from '../utils/useReports';
// Statuses
enum JOB_STATUSES {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  WARNINGS = 'completed_with_warnings',
}

const getJobStatus = (jobStatus: JOB_STATUSES) => {
  switch (jobStatus) {
    case JOB_STATUSES.PENDING:
      return 'Pending';
    case JOB_STATUSES.PROCESSING:
      return 'Processing';
    case JOB_STATUSES.COMPLETED:
      return 'Completed';
    case JOB_STATUSES.FAILED:
      return 'Failed';
    case JOB_STATUSES.WARNINGS:
      return 'Completed with warnings';
    default:
      return 'Unknown';
  }
};

const getContentType = (contentType: string) => {
  // This is vaguer than x-pack/plugins/reporting/public/management/report_listing.tsx
  if (contentType.toLowerCase().includes('pdf')) {
    return 'PDF';
  }

  if (contentType.toLowerCase().includes('csv')) {
    return 'CSV';
  }

  if (contentType.toLowerCase().includes('png')) {
    return 'PNG';
  }

  return contentType;
};

export const guessAppIconTypeFromObjectType = (type: string): IconType => {
  switch (type) {
    case 'search':
      return 'discoverApp';
    case 'dashboard':
      return 'dashboardApp';
    case 'visualization':
      return 'visualizeApp';
    case 'canvas workpad':
      return 'canvasApp';
    default:
      return 'apps';
  }
};

export const GeneratedReports = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data: reportsResponse, isLoading } = useReports({ page, pageSize });

  const handleChange = ({ page }: { page: { index: number; size: number } }) => {
    setPage(page.index);
    setPageSize(page.size);
  };

  const pagination = {
    pageIndex: page,
    totalItemCount: reportsResponse?.total ?? 0,
    pageSize,
  };

  const tableColumnWidths = {
    type: '5%',
    title: '30%',
    status: '20%',
    createdAt: '25%',
    content: '10%',
    actions: '10%',
  };

  const tableColumns: Array<EuiBasicTableColumn<any>> = [
    {
      field: 'type',
      width: tableColumnWidths.type,
      name: 'Type',
      render: (_type: string, { payload: job }) => {
        return (
          <EuiIconTip
            type={guessAppIconTypeFromObjectType(job.objectType)}
            size="s"
            content={job.objectType}
          />
        );
      },
    },
    {
      field: 'title',
      name: 'Title',
      width: tableColumnWidths.title,
      render: (_objectTitle: string, job) => {
        return <div>{job.payload.title || 'Untitled'}</div>;
      },
    },
    {
      field: 'status',
      width: tableColumnWidths.status,
      name: 'Status',
      render: (_status: string, job) => {
        return getJobStatus(job.status);
      },
    },
    {
      field: 'created_at',
      width: tableColumnWidths.createdAt,
      name: 'Created at',
      render: (_createdAt: string, job) => new Date(job.created_at).toLocaleString(),
    },
    {
      field: 'content',
      width: tableColumnWidths.content,
      name: 'Content',
      render: (_status: string, job) => {
        return getContentType(job.jobtype);
      },
    },
    {
      name: 'Actions',
      width: tableColumnWidths.actions,
      actions: [
        {
          isPrimary: true,
          type: 'icon',
          icon: 'download',
          name: 'Download report',
          description: 'Download this report on a new tab',
          onClick: (job: any) => {
            window.open(`/api/reporting/jobs/download/${job.id}`, '_blank');
          },
          enabled: (job) => [JOB_STATUSES.COMPLETED, JOB_STATUSES.WARNINGS].includes(job.status),
        },
      ],
    },
  ];

  if (isLoading) {
    return <div>Loading your reports</div>;
  }

  return (
    <>
      <EuiBasicTable
        items={reportsResponse?.results as []}
        columns={tableColumns}
        pagination={pagination}
        onChange={handleChange}
      />
    </>
  );
};
