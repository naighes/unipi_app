import SwiftUI

extension Alert {
    init(data: AlertData) {
        self.init(title: Text(data.title),
                  message: Text(data.message),
                  dismissButton: .default(Text("ok")))
    }
}
