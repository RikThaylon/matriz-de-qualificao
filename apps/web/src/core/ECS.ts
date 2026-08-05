import * as THREE from 'three'

export type EntityId = string

export interface ComponentMap {
  Transform: { position: THREE.Vector3; rotation: THREE.Euler; scale: THREE.Vector3 }
  Render: { color: string; visible: boolean; meshType: string }
  PathFollower: { path: THREE.Vector3[]; currentIndex: number; speed: number; active: boolean }
  Telemetry: { oee: number; temperature: number; vibration: number; lastUpdate: number }
}

export type ComponentName = keyof ComponentMap

export class Entity {
  public readonly id: EntityId
  private components: Map<ComponentName, any> = new Map()

  constructor(id: EntityId) {
    this.id = id
  }

  public addComponent<K extends ComponentName>(name: K, data: ComponentMap[K]): this {
    this.components.set(name, data)
    return this
  }

  public getComponent<K extends ComponentName>(name: K): ComponentMap[K] | undefined {
    return this.components.get(name)
  }

  public hasComponent(name: ComponentName): boolean {
    return this.components.has(name)
  }

  public removeComponent(name: ComponentName): this {
    this.components.delete(name)
    return this
  }
}

export abstract class ECSSystem {
  public abstract update(entities: Entity[], delta: number): void
}

export class PathFollowerSystem extends ECSSystem {
  public update(entities: Entity[], delta: number): void {
    for (const entity of entities) {
      if (!entity.hasComponent('Transform') || !entity.hasComponent('PathFollower')) continue

      const transform = entity.getComponent('Transform')!
      const pathFollower = entity.getComponent('PathFollower')!

      if (!pathFollower.active || pathFollower.path.length === 0) continue

      const target = pathFollower.path[pathFollower.currentIndex]
      if (!target) continue

      const dist = transform.position.distanceTo(target)
      if (dist < 0.2) {
        pathFollower.currentIndex++
        if (pathFollower.currentIndex >= pathFollower.path.length) {
          pathFollower.active = false
        }
      } else {
        const dir = target.clone().sub(transform.position).normalize()
        transform.position.add(dir.multiplyScalar(pathFollower.speed * delta))
      }
    }
  }
}

export class ECSWorld {
  private entities: Map<EntityId, Entity> = new Map()
  private systems: ECSSystem[] = []

  constructor() {
    this.registerSystem(new PathFollowerSystem())
  }

  public createEntity(id: EntityId): Entity {
    const entity = new Entity(id)
    this.entities.set(id, entity)
    return entity
  }

  public getEntity(id: EntityId): Entity | undefined {
    return this.entities.get(id)
  }

  public registerSystem(system: ECSSystem): void {
    this.systems.push(system)
  }

  public tick(delta: number): void {
    const entityList = Array.from(this.entities.values())
    for (const system of this.systems) {
      system.update(entityList, delta)
    }
  }
}

export const ecsWorld = new ECSWorld()
