import { InspectionResponse } from "../services/api";

interface Props {
  data: InspectionResponse;
}

export default function DamageMap({ data }: Props) {
  const filename = data.image_path.split(/[/\\]/).pop(); 
  const imageUrl = `http://127.0.0.1:8000/uploads/${filename}`;

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto items-center">
      
      {/* 1. TOP SECTION: Image & Bounding Boxes (Tightly Wrapped) */}
      <div className="relative inline-block border-2 border-gray-700 rounded-lg overflow-hidden shadow-2xl">
        <img 
          src={imageUrl} 
          alt="Analyzed Infrastructure" 
          className="max-w-full h-auto block"
          style={{ maxHeight: '600px' }} 
        />

        {/* Overlay Defect Boxes */}
        {data.defects.map((defect, index) => {
          const [nx1, ny1, nx2, ny2] = defect.bbox;
          const left = nx1 * 100;
          const top = ny1 * 100;
          const width = (nx2 - nx1) * 100;
          const height = (ny2 - ny1) * 100;

          let borderColor = "border-yellow-400"; 
          if (defect.severity === "High") borderColor = "border-orange-500";
          if (defect.severity === "Critical") borderColor = "border-red-600";

          return (
            <div
              key={index}
              className={`absolute border-4 ${borderColor} bg-opacity-20 hover:bg-white hover:bg-opacity-30 transition-colors pointer-events-none`}
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: `${width}%`,
                height: `${height}%`,
              }}
            >
              {/* Standard Label Tag */}
              <span className="absolute -top-6 left-0 bg-black bg-opacity-75 text-white text-xs px-1 rounded whitespace-nowrap">
                {defect.defect_type} ({Math.round(defect.confidence * 100)}%)
              </span>
            </div>
          );
        })}
      </div>

    </div>
  );
}
