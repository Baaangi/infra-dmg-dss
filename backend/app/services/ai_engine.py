from ultralytics import YOLO
from typing import List, Dict, Any
from huggingface_hub import hf_hub_download

class AIEngine:
    def __init__(self):
        # Cache for loaded models so we only use RAM when needed
        self.active_models = {}
        
        # Configuration for different infrastructure types
        self.model_configs = {
            "Road": { # Pothole & Garbage Detector
                "repo_id": "utkarsh-23/yolov8m-garbage-pothole-detector",
                "filename": "best.pt",
                "fallback": "yolov8n.pt"
            },
            "Bridge": { # Example Structural Detector (Replace with your actual repo later)
                "repo_id": None, 
                "filename": None,
                "fallback": "yolov8n.pt"
            },
            "Building": { # Fallback to base YOLO for testing if you don't have a model yet
                "repo_id": None, 
                "filename": None,
                "fallback": "yolov8n.pt"
            }
        }

    def _get_model(self, infra_type: str) -> YOLO:
        """Lazily load models into memory."""
        if infra_type not in self.model_configs:
            infra_type = "Road"
            
        if infra_type not in self.active_models:
            config = self.model_configs[infra_type]
            try:
                if config["repo_id"]:
                    model_path = hf_hub_download(repo_id=config["repo_id"], filename=config["filename"])
                    self.active_models[infra_type] = YOLO(model_path)
                else:
                    self.active_models[infra_type] = YOLO(config["fallback"])
                print(f"Successfully loaded model for {infra_type}.")
            except Exception as e:
                print(f"Failed to load specific model for {infra_type}, using fallback... {e}")
                self.active_models[infra_type] = YOLO(config["fallback"])
                
        return self.active_models[infra_type]

    async def detect_damage(self, image_path: str, infra_type: str = "Road") -> List[Dict[str, Any]]:
        """
        Runs the image through the custom crack-detection model based on infra_type.
        Returns a list of detected objects (defects).
        """
        # Fetch appropriate model
        model = self._get_model(infra_type)

        # Run inference using a low confidence, but STRICT iou to remove overlapping boxes.
        # iou=0.2 indicates any bounding boxes that overlap by more than 20% will be merged.
        results = model(image_path, conf=0.02, iou=0.2)[0]
        
        defects = []
        
        # Sort internal bounding boxes by confidence and only keep the absolute top 3 most-likely cracks
        sorted_boxes = sorted(results.boxes, key=lambda x: float(x.conf), reverse=True)
        top_boxes = sorted_boxes[:3]
        
        # Get the original image dimensions
        orig_h, orig_w = results.orig_shape

        for box in top_boxes:
            # Box coordinates: x1, y1, x2, y2 in absolute pixels
            x1, y1, x2, y2 = box.xyxy.tolist()[0]
            
            # Normalize coordinates to 0.0 - 1.0 percentages for responsive UI scaling
            nx1, ny1 = x1 / orig_w, y1 / orig_h
            nx2, ny2 = x2 / orig_w, y2 / orig_h
            
            # Confidence score
            conf = float(box.conf)
            # Custom Model Class Name 
            cls_id = int(box.cls)
            class_name = model.names[cls_id]
            
            # Strict Allowlist: YOLO is pre-trained on 80 random everyday items (trains, dogs, cars).
            # Because our confidence is incredibly low (0.02), it will hallucinate these base objects easily.
            # We must explicitly ONLY allow valid infrastructure damage keywords.
            valid_defects = ["pothole", "potholes", "crack", "cracks", "damage", "spalling", "rust"]
            if not any(defect in class_name.lower() for defect in valid_defects):
                continue
            
            # Map the confidence to our application's severity framework
            severity = "Low"
            if conf > 0.8:
                severity = "Critical"
            elif conf > 0.5:
                severity = "High"
            elif conf > 0.3:
                severity = "Medium"

            defects.append({
                "defect_type": class_name.capitalize(), 
                "confidence": conf,
                "severity": severity,
                "bbox": [nx1, ny1, nx2, ny2]
            })
            
        return defects

    def calculate_risk_score(self, defects: List[Dict]) -> float:
        """
        Calculate refined risk score (0-100) using a base-severity + penalty model.
        """
        if not defects:
            return 0.0
            
        weights = {"Low": 10, "Medium": 25, "High": 50, "Critical": 80}
        
        # Base score is the absolute highest single defect severity
        base_score = max([weights.get(d["severity"], 0) for d in defects] or [0])
        
        # Add a +5 penalty for every additional defect found in the image
        penalty = max(0, len(defects) - 1) * 5
        
        score = base_score + penalty
        
        return min(score, 100.0)

ai_engine = AIEngine()