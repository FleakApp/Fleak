import { Skeleton } from "@fleak-org/ui";

export default function PostSkeleton() {
  return (
    <div className="flex flex-col space-y-3 p-3">
      <div className="flex items-start gap-3">
        <div className="shrink-0">
          <Skeleton className="size-16 rounded-full bg-gray-200" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-2">
            <Skeleton className="size-8 rounded-full bg-gray-200" />
            <Skeleton className="h-6 bg-gray-200 tablet:w-[250px]" />
          </div>

          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-[90px] bg-gray-200 tablet:w-[150px]" />
            <Skeleton className="size-2 bg-gray-200" />
            <Skeleton className="h-4 w-[90px] bg-gray-200 tablet:w-[150px]" />
          </div>
        </div>
        <Skeleton className="size-10 rounded-lg bg-gray-200" />
      </div>

      <Skeleton className="h-6 w-[250px] bg-gray-200" />
      <Skeleton className="h-[225px] w-full rounded-xl bg-gray-200" />

      <div className="flex justify-between space-x-2">
        <div className="flex space-x-2">
          <Skeleton className="size-10 bg-gray-200" />
          <Skeleton className="size-10 bg-gray-200" />
          <Skeleton className="size-10 bg-gray-200" />
          <Skeleton className="h-10 w-[90px] bg-gray-200 tablet:w-[150px]" />
          <Skeleton className="size-10 bg-gray-200" />
        </div>
        <Skeleton className="h-10 w-[90px] bg-gray-200 tablet:w-[150px]" />
      </div>
    </div>
  );
}
