import Foundation

struct AlertData: Identifiable {
    let id: String
    let title: String
    let message: String
    
    init(id: String,
         title: String,
         message: String) {
        self.id = id
        self.title = title
        self.message = message
    }
    
    init(error: Error) {
        self.init(id: error.stringValue,
                  title: "error",
                  message: error.stringValue)
    }
}
