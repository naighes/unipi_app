import SwiftUI
import API

struct BookletView: View {
    let careerId: Int
    @ObservedObject var viewModel: BookletViewModel = BookletViewModel()

    @State var data: API.BookletOp.Response.Status200? = nil
    @State var currentError: AlertData?
    @State var isLoading: Bool = false

    let keychain = Keychain()
    let formatter = getDateFormatter()
    
    static func getDateFormatter() -> DateFormatter {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .none
        formatter.locale = Locale(identifier: "en_US")
        return formatter
    }

    var body: some View {
        List(data?.records ?? [], id: \.code) { element in
            HStack {
                Text(element.name ?? "[unknown]")
                Text(element.score.flatMap({ v in String(v) }) ?? "-")
                Text(element.date.flatMap({ v in formatter.string(from: v) }) ?? "-")
            }.contentShape(Rectangle())
        }
        .progressView(when: isLoading)
        .alert(item: $currentError,
               content: { Alert(title: Text($0.title),
                                message: Text($0.message),
                                dismissButton: .default(Text("ok"))) })
        .onReceive(viewModel.state,
                   perform: { state in updateState(state) })
        .navigationTitle("booklet")
        .navigationViewStyle(StackNavigationViewStyle())
        .onAppear(perform: {
            if data == nil {
                viewModel.getBooklet(
                    token: keychain.accessToken!,
                    careerId: self.careerId
                )
            }
        })
    }
}

private extension BookletView {
    private func updateState(_ state: BookletView.ViewState) {
        switch state {
        case .idle:
            loading()
        case .loading:
            loading()
        case let .content(data: data):
            content(data: data)
        case let .fail(error: error):
            fail(error: error)
        }
    }

    private func loading() {
        self.isLoading = true
    }
    
    private func idle() {
        self.isLoading = false
    }

    private func content(data: API.BookletOp.Response.Status200) {
        self.isLoading = false
        self.data = data
        self.currentError = nil
    }

    private func fail(error: Error) {
        self.currentError = AlertData(id: error.stringValue,
                                      title: "error",
                                      message: error.stringValue)
        self.isLoading = false
    }
}
