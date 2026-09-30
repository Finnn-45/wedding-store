/**
 * Shop skeleton — quiet shell frames in the house style, no shimmer.
 * Shown while filters/search resolve on the server.
 */
export default function ShopLoading() {
  return (
    <div aria-hidden="true" className="pb-20">
      <div className="border-b border-line py-14 lg:py-20">
        <div className="mx-auto w-full max-w-[90rem] px-5 sm:px-8 lg:px-12">
          <div className="h-6 w-40 border border-line bg-shell/60" />
          <div className="mt-6 h-12 w-full max-w-xl border border-line bg-shell/60" />
        </div>
      </div>

      <div className="mx-auto w-full max-w-[90rem] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        <div className="flex gap-7 border-b border-line pb-8">
          {[64, 110, 72, 90].map((width) => (
            <span
              key={width}
              className="block h-4 border border-line bg-shell/60"
              style={{ width }}
            />
          ))}
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="aspect-4/5 border border-line bg-shell/60"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
