import Foundation

struct Plan {
    let name: String
    let entries: [PlanEntry]
}

struct PlanEntry {
    let code: String
    let name: String
}
