import SwiftUI

struct LoaderView: View {
    let isLoading: Bool
    
    var body: some View {
        if isLoading {
            ZStack {
                Color
                    .black
                    .opacity(0.3)
                ProgressView()
                    .scaleEffect(2.0)
            }
            .ignoresSafeArea()
        } else {
            EmptyView()
        }
    }
}
