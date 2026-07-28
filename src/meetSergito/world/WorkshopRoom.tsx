import { ContactShadows, Environment } from '@react-three/drei'
import { MEET_SERGITO } from '../config'
import { WORKSHOP_SHELF } from './workshopFigureLayout'
import { WorkshopDesk } from './WorkshopProps'
import { WorkshopFigures } from './WorkshopFigures'
import { WorkshopShelves, WorkshopWoodShell } from './WorkshopWoodShell'

/** 木造の制作工房 */
export function WorkshopRoom() {
  const { desk } = MEET_SERGITO

  return (
    <group>
      <color attach="background" args={['#1a120c']} />
      <fog attach="fog" args={['#1a120c', 30, 55]} />

      <Environment preset="apartment" environmentIntensity={0.32} />

      <ambientLight intensity={0.2} color="#fff0e0" />
      <hemisphereLight args={['#fff6ea', '#3a2818', 0.42]} />

      <directionalLight
        castShadow
        position={[5, 14, 6]}
        intensity={1.1}
        color="#fff0dc"
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-camera-near={0.5}
        shadow-camera-far={45}
        shadow-bias={-0.00015}
      />

      <spotLight
        position={[-10.5, 4.8, 0]}
        angle={0.55}
        penumbra={0.65}
        intensity={130}
        distance={30}
        color="#fff0d8"
        castShadow
      >
        <object3D attach="target" position={[0, 1.2, 0]} />
      </spotLight>

      <spotLight
        position={[desk.x, 4.2, desk.z + 2.5]}
        angle={0.52}
        penumbra={0.55}
        intensity={85}
        distance={18}
        color="#ffe4b8"
      >
        <object3D attach="target" position={[desk.x, 0.9, desk.z]} />
      </spotLight>

      {[WORKSHOP_SHELF.leftCenterX, WORKSHOP_SHELF.rightCenterX].map((x) => (
        <pointLight key={x} position={[x, 3.2, 0]} intensity={5} distance={10} decay={2} color="#ffd8a8" />
      ))}

      <ContactShadows
        position={[0, 0.008, 0]}
        opacity={0.55}
        scale={28}
        blur={2.8}
        far={5.5}
        color="#1a1008"
      />

      <WorkshopWoodShell />
      <WorkshopDesk />
      <WorkshopShelves />
      <WorkshopFigures />
    </group>
  )
}
