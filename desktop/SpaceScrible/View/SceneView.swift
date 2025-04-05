import SwiftUI
import SceneKit

struct SceneView: View {
    @ObservedObject var webSocketManager: WebSocketManager
    @State private var pathColor: NSColor = .systemBlue // 🎨 Default path color

    var body: some View {
        VStack {
            SceneKitView(sensorData: webSocketManager.sensorData, pathColor: pathColor)
                .frame(width: 400, height: 400)
                .onChange(of: webSocketManager.sensorData) { newData in
                    if let newData = newData {
                        print("✅ Updated sensor data for SceneKit: \(newData)")
                    }
                }

            HStack {
                Button(action: {
                    NotificationCenter.default.post(name: NSNotification.Name("ClearPath"), object: nil)
                }) {
                    Text("🧹 Clear Path")
                        .padding()
                        .background(Color.red.opacity(0.8))
                        .foregroundColor(.white)
                        .cornerRadius(8)
                }

                Button(action: {
                    pathColor = getRandomColor()
                }) {
                    Text("🎨 Change Path Color")
                        .padding()
                        .background(Color.blue.opacity(0.8))
                        .foregroundColor(.white)
                        .cornerRadius(8)
                }
            }
        }
    }

    // ✅ Generate a random color
    private func getRandomColor() -> NSColor {
        return NSColor(
            red: CGFloat.random(in: 0...1),
            green: CGFloat.random(in: 0...1),
            blue: CGFloat.random(in: 0...1),
            alpha: 1.0
        )
    }
}

struct SceneKitView: View {
    var sensorData: SensorData?
    var pathColor: NSColor

    var body: some View {
        SceneKitContainer(sensorData: sensorData, pathColor: pathColor)
    }
}

struct SceneKitContainer: NSViewRepresentable {
    var sensorData: SensorData?
    var pathColor: NSColor
    
    class Coordinator {
        var pathPoints: [SCNVector3] = []
        let cameraNode = SCNNode()

        init() {
            let camera = SCNCamera()
            cameraNode.camera = camera
        }
    }

    func makeCoordinator() -> Coordinator {
        return Coordinator()
    }

    func makeNSView(context: Context) -> SCNView {
        let scnView = SCNView()
        scnView.scene = SCNScene()
        scnView.autoenablesDefaultLighting = true
        scnView.allowsCameraControl = true

        // ✅ Add camera to the scene
        scnView.scene?.rootNode.addChildNode(context.coordinator.cameraNode)
        adjustCameraPosition(context: context, scnView: scnView)

        // ✅ Listen for ClearPath notification to remove paths
        NotificationCenter.default.addObserver(forName: NSNotification.Name("ClearPath"), object: nil, queue: .main) { _ in
            context.coordinator.pathPoints.removeAll()
            clearAllPaths(in: scnView)
        }

        return scnView
    }

    func updateNSView(_ nsView: SCNView, context: Context) {
        guard let sensorData = sensorData else { return }

        // ✅ Create a new 3D point using accelerometer data
        let newPoint = SCNVector3(
            CGFloat(sensorData.accelerometer.x) * 5,
            CGFloat(sensorData.accelerometer.y) * 5,
            CGFloat(sensorData.accelerometer.z) * 5
        )

        // ✅ Add the new point to pathPoints
        context.coordinator.pathPoints.append(newPoint)

        // ✅ Draw path in 3D using Bezier interpolation for smoothness
        drawPath(in: nsView, with: context.coordinator.pathPoints, color: pathColor)

        // ✅ Update camera position to fit path dynamically
        adjustCameraPosition(context: context, scnView: nsView)
    }

    // ✅ Draw continuous path with color support and Bezier smoothing
    private func drawPath(in nsView: SCNView, with points: [SCNVector3], color: NSColor) {
        guard points.count > 1 else { return }

        // ✅ Create a line geometry with Bezier interpolation for smoother paths
        let pathGeometry = createBezierLineGeometry(from: points, color: color)

        // ✅ Remove previous paths and add the new path
        nsView.scene?.rootNode.childNodes.forEach { node in
            if node.geometry is SCNGeometry {
                node.removeFromParentNode()
            }
        }

        let pathNode = SCNNode(geometry: pathGeometry)
        nsView.scene?.rootNode.addChildNode(pathNode)
    }

    // ✅ Create smooth Bezier line geometry with color
    private func createBezierLineGeometry(from points: [SCNVector3], color: NSColor) -> SCNGeometry {
        guard points.count >= 4 else {
            return createSimpleLine(from: points, color: color)
        }

        var bezierPoints: [SCNVector3] = []

        for i in stride(from: 0, to: points.count - 3, by: 3) {
            let p0 = points[i]
            let p1 = points[i + 1]
            let p2 = points[i + 2]
            let p3 = points[i + 3]

            for t in stride(from: 0.0, through: 1.0, by: 0.05) {
                bezierPoints.append(SCNVector3.interpolate(p0: p0, p1: p1, p2: p2, p3: p3, t: Float(t)))
            }
        }

        return createSimpleLine(from: bezierPoints, color: color)
    }

    // ✅ Fallback for simple line drawing
    private func createSimpleLine(from points: [SCNVector3], color: NSColor) -> SCNGeometry {
        let vertexSource = SCNGeometrySource(vertices: points)

        var indices: [Int32] = []
        for i in 0..<(points.count - 1) {
            indices.append(Int32(i))
            indices.append(Int32(i + 1))
        }

        let indexData = Data(bytes: indices, count: MemoryLayout<Int32>.size * indices.count)
        let element = SCNGeometryElement(data: indexData, primitiveType: .line, primitiveCount: points.count - 1, bytesPerIndex: MemoryLayout<Int32>.size)

        // ✅ Apply color to the geometry
        let material = SCNMaterial()
        material.diffuse.contents = color

        let geometry = SCNGeometry(sources: [vertexSource], elements: [element])
        geometry.materials = [material]
        return geometry
    }

    // ✅ Clear all paths from SceneKit
    private func clearAllPaths(in nsView: SCNView) {
        nsView.scene?.rootNode.childNodes.forEach { node in
            if node.geometry is SCNGeometry {
                node.removeFromParentNode()
            }
        }
    }

    // ✅ Automatically adjust camera to fit path
    private func adjustCameraPosition(context: Context, scnView: SCNView) {
        guard !context.coordinator.pathPoints.isEmpty else { return }

        let minPoint = context.coordinator.pathPoints.reduce(context.coordinator.pathPoints[0]) {
            SCNVector3(
                min($0.x, $1.x),
                min($0.y, $1.y),
                min($0.z, $1.z)
            )
        }

        let maxPoint = context.coordinator.pathPoints.reduce(context.coordinator.pathPoints[0]) {
            SCNVector3(
                max($0.x, $1.x),
                max($0.y, $1.y),
                max($0.z, $1.z)
            )
        }

        let center = SCNVector3(
            (minPoint.x + maxPoint.x) / 2,
            (minPoint.y + maxPoint.y) / 2,
            (minPoint.z + maxPoint.z) / 2
        )

        // ✅ Set camera position to view entire path
        let cameraDistance: CGFloat = 50.0
        context.coordinator.cameraNode.position = SCNVector3(
            CGFloat(center.x),
            CGFloat(center.y),
            CGFloat(center.z) + cameraDistance
        )

        // ✅ Smooth camera transition
        let moveAction = SCNAction.move(to: SCNVector3(
            CGFloat(center.x),
            CGFloat(center.y),
            CGFloat(center.z) + cameraDistance
        ), duration: 0.5)

        context.coordinator.cameraNode.runAction(moveAction)

        // ✅ Focus camera on center
        let lookAtConstraint = SCNLookAtConstraint(target: createTargetNode(at: center))
        lookAtConstraint.isGimbalLockEnabled = true
        context.coordinator.cameraNode.constraints = [lookAtConstraint]

        // ✅ Helper function to create target node for focus
        func createTargetNode(at position: SCNVector3) -> SCNNode {
            let targetNode = SCNNode()
            targetNode.position = position
            return targetNode
        }
    }
}

// ✅ Extension to handle Bezier Interpolation
extension SCNVector3 {
    // ✅ Cubic Bezier Interpolation Function
    static func interpolate(p0: SCNVector3, p1: SCNVector3, p2: SCNVector3, p3: SCNVector3, t: Float) -> SCNVector3 {
        let u = 1 - t
        let tt = t * t
        let uu = u * u
        let uuu = uu * u
        let ttt = tt * t

        // ✅ Bezier formula
        let p = (p0 * uuu) +
                (p1 * 3 * uu * t) +
                (p2 * 3 * u * tt) +
                (p3 * ttt)

        return p
    }
    
    // ✅ Overloaded operators for SCNVector3
    static func * (left: SCNVector3, right: Float) -> SCNVector3 {
        let rightCGFloat = CGFloat(right)
        return SCNVector3(
            left.x * rightCGFloat,
            left.y * rightCGFloat,
            left.z * rightCGFloat
        )
    }

    static func + (left: SCNVector3, right: SCNVector3) -> SCNVector3 {
        return SCNVector3(
            left.x + right.x,
            left.y + right.y,
            left.z + right.z
        )
    }
}
