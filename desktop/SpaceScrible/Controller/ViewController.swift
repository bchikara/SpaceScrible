import Cocoa
import SwiftUI

class ViewController: NSViewController {
    var webSocketManager: WebSocketManager!

    override func viewDidLoad() {
        super.viewDidLoad()

        // ✅ Initialize the WebSocket manager and start receiving data
        webSocketManager = WebSocketManager()

        // ✅ Load the SwiftUI view into the macOS app window
        let contentView = ContentView()
        let hostingController = NSHostingController(rootView: contentView)
        self.view.addSubview(hostingController.view)
        hostingController.view.frame = self.view.bounds
    }
}
