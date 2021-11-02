import SwiftUI

struct AccountView: View {
    @Binding var showingSheet: Bool
    
    var body: some View {
        VStack {
            Text("Account view")
            Button("Remove account", action: {
                Keychain().accessToken = nil
                showingSheet = true
            })
        }
    }
}
