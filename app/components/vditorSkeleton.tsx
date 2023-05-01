export function VditorSkeleton() {
  return (
    <div id="vditor" className="h-[90px] vditor">
      <div className="vditor-content">
        <div className="vditor-resize vditor-resize--bottom">
          <div>
            <svg>
              <use xlinkHref="#vditor-icon-resize" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}