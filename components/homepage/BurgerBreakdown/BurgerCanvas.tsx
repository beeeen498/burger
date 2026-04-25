import { Canvas } from "@react-three/fiber";
import BurgerGroup from "./BurgerGroup";
import styles from "./BurgerCanvas.module.scss";

export default function BurgerCanvas() {
  return (
    <div className={styles.wrapper}>
      <Canvas
        frameloop="always"
        camera={{ position: [0, -55, -1], fov: 10 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(0x000000, 0);
          scene.background = null;
        }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <BurgerGroup />
      </Canvas>
    </div>
  );
}