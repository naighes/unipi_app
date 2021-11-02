import SwiftUI

struct MainView: View {
    @State private var showingSheet = Keychain().accessToken == nil
    
    var body: some View {
        TabView {
            AccountView(showingSheet: $showingSheet)
                .tabItem {
                    Label("Account", systemImage: "person.crop.circle")
                }
            CoursesView().tabItem { Label("Courses", systemImage: "book.circle") }
        }.fullScreenCover(isPresented: $showingSheet) {
            FacultiesView()
        }
    }
}
