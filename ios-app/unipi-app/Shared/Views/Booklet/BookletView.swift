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

    func getStatusImageSymbol(_ index: Int?) -> (String, Color) {
        switch index {
            case 1: return ("bookmark.circle", .blue) // Planned
            case 2: return ("bookmark.circle", .yellow) // Attended
            case 3: return ("bookmark.circle.fill", .green) // Passed
            default: return ("questionmark.app", .gray) // Unknow
        }
    }

    @ViewBuilder
    func getStatusImage(_ index: Int?) -> some View {
        Image(systemName: getStatusImageSymbol(index).0)
            .foregroundColor(getStatusImageSymbol(index).1)
            .frame(width: 24, height: 24)
            .padding(16)
            .background(Color.primary_color)
            .cornerRadius(4)
    }

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
                getStatusImage(element.status)
                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        TextView(
                            text: element.name ?? "[unknown]",
                            type: .subtitle_1
                        )
                    }
                    HStack {
                        TextView(
                            text: element.code ?? "",
                            type: .body_2
                        )
                        Spacer()
                        TextView(
                            text: element.date.flatMap({ v in formatter.string(from: v) }) ?? "-",
                            type: .body_2
                        ).foregroundColor(Color.text_primary_color)
                    }
                }.padding(.leading, 4)

                if let score = element.score, let value = String(score) {
                    Text(value).padding(6)
                        .foregroundColor(.blue)
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(Color.blue, lineWidth: 4)
                        ).opacity(0.8).padding(6)
                } else {
                    EmptyView()
                }

                Spacer()

            }.contentShape(Rectangle())
        }.padding(8)
            .background(Color.secondary_color).cornerRadius(4)
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
