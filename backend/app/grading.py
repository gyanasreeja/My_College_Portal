def grade_for(total: float) -> str:
    if total >= 90:
        return "O"
    if total >= 80:
        return "A+"
    if total >= 70:
        return "A"
    if total >= 60:
        return "B"
    if total >= 50:
        return "C"
    if total >= 40:
        return "D"
    return "F"


GRADE_POINTS = {"O": 10, "A+": 9, "A": 8, "B": 7, "C": 6, "D": 5, "F": 0}
