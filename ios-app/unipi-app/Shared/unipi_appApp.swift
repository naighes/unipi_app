import SwiftUI

@main
struct unipi_appApp: App {
    var body: some Scene {
        WindowGroup {
            /* TODO
            // FacultiesView will be shown just for the initialization phase.
            // once the choice will be set within UserDefaults, we can skip FacultiesView at all.

            if let facultyId = UserDefaults.standard.data(forKey: "facultyId") {
                FacultiesView()
            } else { // image is not present. set a default image
                CredentialsView()
            }
            */
            FacultiesView()
        }
    }
}
