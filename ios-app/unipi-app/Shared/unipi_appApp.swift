import SwiftUI

@main
struct unipi_appApp: App {
    @State private var currentView: String = "CredentialsView"
    var body: some Scene {
        WindowGroup {
            // TODO
            // FacultiesView will be shown just for the initialization phase.
            // once the choice will be set within UserDefaults, we can skip FacultiesView at all.
            buildView()
        }
    }

    @ViewBuilder
    func buildView() -> some View {
        switch UserDefaults.standard.string(forKey: "facultyId") {
        case .some:
            CredentialsView()
        default:
            FacultiesView()
        }
    }
}
