"use client";
//I dem File setzemer eigentlich s bild wo ingame denn azeigt wird
  import { useState, useEffect } from "react";
  import { Skeleton } from "antd";
  const ROUND_IMAGE_INTERVAL = 9000; //für de countdown
  interface LocationImageProps {
    imageUrl: string;
  }

  const LocationImage: React.FC<LocationImageProps> = ({ imageUrl }) => {
    const [loaded, setLoaded] = useState(false);
    const [progress, setProgress] = useState(100);
    useEffect(() => {
      setLoaded(false);
      setProgress(100); //für de countdown vo da
      const start = Date.now();
      const interval = setInterval(() => {
          const elapsed = Date.now() - start;
          const remaining = Math.max(0, 100 - (elapsed / ROUND_IMAGE_INTERVAL) * 100);
          setProgress(remaining);
          if (remaining === 0) clearInterval(interval);
      }, 50);
      return () => clearInterval(interval); //bis da
    }, [imageUrl]);

    return (
      <div>
            <div style={{ width: "100%", aspectRatio: "16/9", position: "relative" }}>
          {!loaded && (
            <Skeleton.Image
              active
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1 }}
            />
          )}
          <img
            src={imageUrl}
            alt="Location"
            onLoad={() => setLoaded(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: loaded ? 1 : 0,
              transition: "opacity 0.4s ease",
            }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ flex: 1, height: "4px", background: "#1e2940", borderRadius: "0 0 6px 6px" }}>
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "#f4941b",
                borderRadius: "0 0 6px 6px",
                transition: "width 0.05s linear",
              }}
            />
          </div>
          <span style={{ color: "#f4941b", fontSize: "12px", fontWeight: 700, minWidth: "20px" }}>
            {Math.ceil((progress / 100) * (ROUND_IMAGE_INTERVAL / 1000))}s
          </span>
        </div>

      </div>
    );
  };

  export default LocationImage;