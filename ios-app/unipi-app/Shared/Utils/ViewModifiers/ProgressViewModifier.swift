import SwiftUI

extension View {
    func progressView(when isLoading: Bool) -> some View {
        modifier(ProgressViewModifier(isLoading: isLoading))
    }
}

struct ProgressViewModifier: ViewModifier {
    let isLoading: Bool
    
    @ViewBuilder
    func body(content: Content) -> some View {
        switch isLoading {
        case true:
            ZStack {
                content
                ZStack {
                    Color
                        .black
                        .opacity(0.3)
                    ProgressView()
                        .scaleEffect(2.0)
                }
                .ignoresSafeArea()
            }
        default:
            content
        }
    }
}
