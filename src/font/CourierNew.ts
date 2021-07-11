import {Font} from "./Font";

export class CourierNew extends Font {
    constructor() {
        super();

        this.fontSizes = {

            "6pt": [4.8166656494140625, 9.5],
            "7pt": [5.616668701171875, 11.5],
            "8pt": [6.4166717529296875, 13],
            "9pt": [7.2166595458984375, 14.5],
            "10pt": [8.033340454101562, 16],
            "11pt": [8.833328247070312, 17.5],
            "12pt": [9.633331298828125, 19],
            "13pt": [10.433334350585938, 21],
            "14pt": [11.23333740234375, 22],
            "15pt": [12.0333251953125, 24],
            "16pt": [12.850006103515625, 25.5],
            "17pt": [13.649993896484375, 27],
            "18pt": [14.45001220703125, 28.5],
            "19pt": [15.25, 30],
            "20pt": [16.04998779296875, 31.5],
            "21pt": [16.850006103515625, 33],
            "22pt": [17.666671752929688, 34.5],
            "23pt": [18.466659545898438, 36],
            "24pt": [19.26666259765625, 38],
            "25pt": [20.066665649414062, 39],
            "26pt": [20.866668701171875, 41],
            "27pt": [21.666671752929688, 42],
            "28pt": [22.48333740234375, 44],
            "29pt": [23.2833251953125, 45.5],
            "30pt": [24.083343505859375, 47],
            "31pt": [24.883331298828125, 48.5],
            "32pt": [25.683334350585938, 50.5],
            "33pt": [26.483322143554688, 51.5],
            "34pt": [27.300003051757812, 53.5],
            "35pt": [28.100006103515625, 55],
            "36pt": [28.899993896484375, 56.5],
            "37pt": [29.699996948242188, 58],
            "38pt": [30.5, 59.5],
            "39pt": [31.300003051757812, 61],
            "40pt": [32.116668701171875, 63],
            "41pt": [32.91667175292969, 64],
            "42pt": [33.71665954589844, 65.5],
            "43pt": [34.51666259765625, 67.5],
            "44pt": [35.31666564941406, 68.5],
            "45pt": [36.116668701171875, 70.5],
            "46pt": [36.93333435058594, 71.5],
            "47pt": [37.73333740234375, 73.5],
            "48pt": [38.53334045410156, 75],
            "49pt": [39.33332824707031, 76.5],
            "50pt": [40.133331298828125, 78],
            "51pt": [40.93333435058594, 80],
            "52pt": [41.75, 81],
            "53pt": [42.55000305175781, 83],
            "54pt": [43.34999084472656, 84],
            "55pt": [44.15000915527344, 86],
            "56pt": [44.94999694824219, 87.5],
            "57pt": [45.75, 89],
            "58pt": [46.56666564941406, 90.5],
            "59pt": [47.366668701171875, 92.5],
            "60pt": [48.16667175292969, 93.5],
            "61pt": [48.96665954589844, 95],
            "62pt": [49.76666259765625, 96.5],
            "63pt": [50.56666564941406, 98],
            "64pt": [51.383331298828125, 100],
            "65pt": [52.18333435058594, 101],
            "66pt": [52.98333740234375, 103],
            "67pt": [53.78334045410156, 104.5],
            "68pt": [54.58332824707031, 106],
            "69pt": [55.383331298828125, 107.5],
            "70pt": [56.18333435058594, 109.5],
            "71pt": [57, 110.5],
            "72pt": [57.80000305175781, 112.5],
            "73pt": [58.59999084472656, 113.5],
            "74pt": [59.40000915527344, 115.5],
            "75pt": [60.19999694824219, 117],
            "76pt": [61, 118.5],
            "77pt": [61.81666564941406, 120],
            "78pt": [62.616668701171875, 122],
            "79pt": [63.41667175292969, 123],
            "80pt": [64.21665954589844, 125],
            "81pt": [65.01666259765625, 126],
            "82pt": [65.81666564941406, 127.5],
            "83pt": [66.63334655761719, 129.5],
            "84pt": [67.43333435058594, 130.5],
            "85pt": [68.23332214355469, 132.5],
            "86pt": [69.03334045410156, 134],
            "87pt": [69.83332824707031, 135.5],
            "88pt": [70.63333129882812, 137],
            "89pt": [71.44999694824219, 138.5],
            "90pt": [72.25, 140],
            "91pt": [73.05000305175781, 142],
            "92pt": [73.85000610351562, 143],
            "93pt": [74.64999389648438, 145],
            "94pt": [75.44999694824219, 146.5],
            "95pt": [76.26667785644531, 148],
            "96pt": [77.06666564941406, 149.5],
            "97pt": [77.86666870117188, 151.5],
            "98pt": [78.66665649414062, 152.5],
            "99pt": [79.4666748046875, 154.5],
            "100pt": [80.26666259765625, 155.5],
            "101pt": [81.08332824707031, 157.5],
            "102pt": [81.88334655761719, 159],
            "103pt": [82.68331909179688, 160],
            "104pt": [83.48333740234375, 162],
            "105pt": [84.28334045410156, 163.5],
            "106pt": [85.08332824707031, 165],
            "107pt": [85.89999389648438, 166.5]
        };
    }

    getFontName(): string {
        return "Courier New";
    }

    getLineHeight(): number {
        return 2;
    }
}