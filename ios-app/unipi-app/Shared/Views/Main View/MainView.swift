import SwiftUI

struct MainView: View {
    @State private var showingSheet = Keychain().accessToken == nil
    let careerId: Int
    let facultyId: String?
    
    var body: some View {
        TabView {
            AccountView(showingSheet: $showingSheet)
                .tabItem {
                    Label("Account", systemImage: "person.crop.circle")
                }
            CoursesView().tabItem { Label("Courses", systemImage: "book.circle") }
        }
    }
}
