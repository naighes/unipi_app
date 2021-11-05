import SwiftUI

struct MainView: View {
    @State private var showingSheet = Keychain().accessToken == nil
    let careerId: Int
    let facultyId: String?

    var body: some View {
        TabView {
            BookletView(careerId: self.careerId)
                .tabItem {
                    Label("booklet", systemImage: "book.circle")
                }
        }
    }
}
