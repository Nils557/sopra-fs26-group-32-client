"use client";
//I dem File setzemer eigentlich s bild wo ingame denn azeigt wird
  import { useState, useEffect } from "react";
  import { Skeleton } from "antd";

  interface LocationImageProps {
    imageUrl: string;
  }

  const LocationImage: React.FC<LocationImageProps> = ({ imageUrl }) => {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
      setLoaded(false);
    }, [imageUrl]);

    return (
      <div style={{ width: "100%", aspectRatio: "16/9", position: "relative" }}> 
        {!loaded && (
          <Skeleton.Image
            active
            style={{ width: "100%", height: "100%" }}
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
            display: loaded ? "block" : "none",
          }}
        />
      </div>
    );
  };

  export default LocationImage;