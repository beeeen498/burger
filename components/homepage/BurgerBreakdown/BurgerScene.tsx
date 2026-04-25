import { Canvas } from "@react-three/fiber";
import BurgerGroup from "./BurgerGroup";

export default function BurgerScene() {
  return (
    <Canvas
      frameloop="always"
      // Same camera as the Hero so the burger looks identical in size
      camera={{ position: [0, 3, 12], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl, scene }) => {
        // Prevent grey background — must be set before first frame
        gl.setClearColor(0x000000, 0);
        scene.background = null;
      }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <BurgerGroup />
    </Canvas>
  );
}
