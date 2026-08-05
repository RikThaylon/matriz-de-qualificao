import * as THREE from 'three'

export interface GridNode {
  x: number
  z: number
  walkable: boolean
  gCost: number
  hCost: number
  fCost: number
  parent: GridNode | null
}

export class FactoryPathfinding {
  private gridWidth = 40
  private gridHeight = 40
  private nodeSize = 1.0 // 1 meter grid resolution
  private grid: GridNode[][] = []

  constructor() {
    this.initGrid()
  }

  private initGrid(): void {
    for (let x = 0; x < this.gridWidth; x++) {
      this.grid[x] = []
      for (let z = 0; z < this.gridHeight; z++) {
        // World coordinates centered around 0,0
        const worldX = x - this.gridWidth / 2
        const worldZ = z - this.gridHeight / 2

        // Mark machine areas as unwalkable obstacles
        const isNearMachine =
          (Math.abs(worldX - -10) < 2 && Math.abs(worldZ - -5) < 2) || // CNC-01
          (Math.abs(worldX - 0) < 2 && Math.abs(worldZ - -8) < 2) ||   // PR-12
          (Math.abs(worldX - 10) < 2 && Math.abs(worldZ - -5) < 2)     // EMB-02

        this.grid[x][z] = {
          x,
          z,
          walkable: !isNearMachine,
          gCost: 0,
          hCost: 0,
          fCost: 0,
          parent: null,
        }
      }
    }
  }

  public findPath(startVec: THREE.Vector3, targetVec: THREE.Vector3): THREE.Vector3[] {
    const startNode = this.getNodeFromWorldPos(startVec)
    const targetNode = this.getNodeFromWorldPos(targetVec)

    if (!startNode || !targetNode || !targetNode.walkable) {
      return [targetVec]
    }

    const openSet: GridNode[] = [startNode]
    const closedSet: Set<GridNode> = new Set()

    while (openSet.length > 0) {
      openSet.sort((a, b) => a.fCost - b.fCost)
      const current = openSet.shift()!

      closedSet.add(current)

      if (current.x === targetNode.x && current.z === targetNode.z) {
        return this.reconstructPath(startNode, current)
      }

      for (const neighbor of this.getNeighbors(current)) {
        if (!neighbor.walkable || closedSet.has(neighbor)) continue

        const newCostToNeighbor = current.gCost + this.getDistance(current, neighbor)
        if (newCostToNeighbor < neighbor.gCost || !openSet.includes(neighbor)) {
          neighbor.gCost = newCostToNeighbor
          neighbor.hCost = this.getDistance(neighbor, targetNode)
          neighbor.fCost = neighbor.gCost + neighbor.hCost
          neighbor.parent = current

          if (!openSet.includes(neighbor)) {
            openSet.push(neighbor)
          }
        }
      }
    }

    return [targetVec]
  }

  private getNodeFromWorldPos(pos: THREE.Vector3): GridNode | null {
    const gx = Math.floor(pos.x + this.gridWidth / 2)
    const gz = Math.floor(pos.z + this.gridHeight / 2)
    if (gx >= 0 && gx < this.gridWidth && gz >= 0 && gz < this.gridHeight) {
      return this.grid[gx][gz]
    }
    return null
  }

  private getNeighbors(node: GridNode): GridNode[] {
    const neighbors: GridNode[] = []
    const dirs = [
      [0, 1], [0, -1], [1, 0], [-1, 0],
      [1, 1], [-1, -1], [1, -1], [-1, 1]
    ]
    for (const [dx, dz] of dirs) {
      const nx = node.x + dx
      const nz = node.z + dz
      if (nx >= 0 && nx < this.gridWidth && nz >= 0 && nz < this.gridHeight) {
        neighbors.push(this.grid[nx][nz])
      }
    }
    return neighbors
  }

  private getDistance(nodeA: GridNode, nodeB: GridNode): number {
    const dstX = Math.abs(nodeA.x - nodeB.x)
    const dstZ = Math.abs(nodeA.z - nodeB.z)
    return dstX > dstZ ? 14 * dstZ + 10 * (dstX - dstZ) : 14 * dstX + 10 * (dstZ - dstX)
  }

  private reconstructPath(startNode: GridNode, endNode: GridNode): THREE.Vector3[] {
    const path: THREE.Vector3[] = []
    let current: GridNode | null = endNode
    while (current && current !== startNode) {
      const worldX = current.x - this.gridWidth / 2
      const worldZ = current.z - this.gridHeight / 2
      path.push(new THREE.Vector3(worldX, 0, worldZ))
      current = current.parent
    }
    return path.reverse()
  }
}

export const factoryPathfinding = new FactoryPathfinding()
