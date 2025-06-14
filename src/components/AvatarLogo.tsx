
import React from "react";

const AvatarLogo = ({ size = 56 }) => (
  <img
    src="/lovable-uploads/a18ab021-2b37-4e5c-97a3-00608fc26747.png"
    alt="AI Bot"
    width={size}
    height={size}
    className="rounded-full object-cover border-4 border-blue-500 shadow-lg"
    style={{ background: "#222d3b" }}
  />
);

export default AvatarLogo;
