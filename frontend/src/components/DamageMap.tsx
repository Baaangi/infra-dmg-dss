import { InspectionResponse } from "../services/api";

interface Props {
  data: InspectionResponse;
}

export default function DamageMap({ data }: Props) {
  // Convert local path (uploads/foo.jpg) to URL (http://localhost:8000/uploads/foo.jpg)
  // Note: We use the filename part because 'image_path' might be absolute in DB
  const filename = data.image_path.split(/[/\\]/).pop(); 
  const imageUrl = `http://127.0.0.1:8000/uploads/${filename}`;

  return (
    <div className="relative inline-block border-2 border-gray-300 rounded-lg overflow-hidden">
      {/* The inspected image. We use a regular img tag to let it size naturally. */}
      {/* In a real app, you might want a fixed canvas size. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src={imageUrl} 
        alt="Analyzed Infrastructure" 
        className="max-w-full h-auto block"
        style={{ maxHeight: '500px' }} // Limit height for UI
      />

      {/* Overlay Defect Boxes */}
      {data.defects.map((defect, index) => {
        const [x1, y1, x2, y2] = defect.bbox;
        const width = x2 - x1;
        const height = y2 - y1;

        // Color coding
        let borderColor = "border-yellow-400"; // Medium
        if (defect.severity === "High") borderColor = "border-orange-500";
        if (defect.severity === "Critical") borderColor = "border-red-600";

        return (
          <div
            key={index}
            title={`${defect.defect_type} (${defect.severity})`}
            className={`absolute border-4 ${borderColor} bg-opacity-20 hover:bg-white hover:bg-opacity-30 cursor-pointer transition-colors`}
            style={{
              left: `${x1}px`,
              top: `${y1}px`,
              width: `${width}px`,
              height: `${height}px`,
            }}
          >
            {/* Label Tag */}
            <span className="absolute -top-6 left-0 bg-black bg-opacity-75 text-white text-xs px-1 rounded whitespace-nowrap">
              {defect.defect_type} ({Math.round(defect.confidence * 100)}%)
            </span>
          </div>
        );
      })}
    </div>
  );
}
