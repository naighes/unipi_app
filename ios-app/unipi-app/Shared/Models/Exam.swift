import Foundation

struct Exam {
    let code: String
    let name: String
    let date: String
    let score: String?
    let status: ExamStatus
}

enum ExamStatus: Int {
    case planned = 1
    case attended = 2
    case passed = 3
    case unknown
}
