import Foundation
import API

class BookletViewModel: ObservableObject {
    let apiClient = APIClient(baseURL: "https://unipi-api.herokuapp.com")
    let keychain = Keychain()
    
    @Published var data: [Exam] = []
    @Published var currentError: AlertData?
    @Published var isLoading: Bool = false

    let getResult: (APIResponse<API.BookletOp.Response>) -> Result<API.BookletOp.Response.Status200, Error> = {
        response in
        switch response.result {
        case let .success(v):
            switch v {
            case let .status200(booklet):
                return .success(booklet)
            default:
                return .failure(NetError.unexpectedStatusCode(v.statusCode))
            }
        case let .failure(e):
            return .failure(NetError.serverError("retrieving booklet failed with error '\(e)'"))
        }
    }

    func getBooklet(token: String, careerId: Int) {
        isLoading = true
        apiClient.makeRequest(
            API.BookletOp.Request(options: API.BookletOp.Request.Options(careerId: careerId)),
            behaviours: [BearerTokenRequestBehaviour(token: token)]
        ) { [weak self] response in
            guard let self = self else { return }
            self.isLoading = false
            switch self.getResult(response) {
            case .success(let data):
                self.data = data.records?.map(Exam.init) ?? []
            case .failure(let error):
                // TODO: check if token is expired and renew it
                self.currentError = AlertData(error: error)
            }
        }
    }
}

private extension Exam {
    static var formatter: DateFormatter {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .none
        formatter.locale = Locale(identifier: "en_US")
        return formatter
    }
    
    init(_ record: API.BookletOp.Response.Status200.Records) {
        self.init(code: record.code ?? "[unknown]",
                  name: record.name ?? "[unknown]",
                  date: record.date.map(Exam.formatter.string) ?? "-",
                  score: record.score.map(String.init),
                  status: record.status.flatMap(ExamStatus.init) ?? .unknown)
    }
}
