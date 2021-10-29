import SwiftUI

@main
struct unipi_appApp: App {
    @State private var currentView: String = "CredentialsView"
    var body: some Scene {
        WindowGroup {
            buildView()
        }
    }

    @ViewBuilder
    func buildView() -> some View {
        switch UserDefaults.standard.string(forKey: "facultyId") {
        case .some(let id):
            CredentialsView(facultyId: id)
        default:
            FacultiesView()
        }
    }
}
