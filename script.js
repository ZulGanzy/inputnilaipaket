let dataSiswa = [];
let processedStudents = []; // Global array to store processed student data for ranking

// Define column indices for clarity, based on your provided data structure
const mapelIndex = {
  NIS: 0,
  NAMA: 1,
  KELAS: 2,
  AVG_MTK: 3,
  AVG_FIS: 4,
  AVG_KIM: 5,
  AVG_BIO: 6,
  AVG_EKO: 7,
  AVG_INF: 8,
  AVG_GEO: 9,
  AVG_SOSIO: 10,
  // Assuming MTK1, FIS1 etc. are PTS Semester 2 scores
  RAPORT_MTK: 12,
  RAPORT_FIS: 13,
  RAPORT_KIM: 14,
  RAPORT_BIO: 15,
  RAPORT_EKO: 16,
  RAPORT_INF: 17,
  RAPORT_GEO: 18,
  RAPORT_SOSIO: 19,
  // MTK2, FIS2 etc. are present in your mapelIndex but not used in this iteration
  PTS_MTK2: 20,
  PTS_FIS2: 21,
  PTS_KIM2: 22,
  PTS_BIO2: 23,
  PTS_EKO2: 24,
  PTS_GEO2: 25,
  PTS_INF2: 26,
  PTS_SOSIO2: 27,
  // The original RANK1 and RANK2 are now calculated dynamically
  // RANK1: 30,
  // RANK2: 32,
};

// Function to show custom alert
function showCustomAlert(title, message) {
  const modal = document.getElementById("customAlertModal");
  document.getElementById("alertTitle").textContent = title;
  document.getElementById("alertMessage").textContent = message;
  modal.classList.remove("hidden");
  modal.classList.add("active");
}

// Function to close custom alert
function closeCustomAlert() {
  const modal = document.getElementById("customAlertModal");
  modal.classList.remove("active");
  modal.classList.add("hidden");
}

// Load last entered NIS from localStorage on page load
document.addEventListener("DOMContentLoaded", function () {
  const savedNIS = localStorage.getItem("lastNIS");
  if (savedNIS) {
    document.getElementById("nisInput").value = savedNIS;
  }
});

// Function to calculate dynamic ranks for all students
function calculateRanks() {
  // Prepare data for ranking: calculate totalA and totalB for all students
  processedStudents = dataSiswa.map((row) => {
    const totalA = (parseFloat(row[mapelIndex.AVG_MTK]) || 0) + (parseFloat(row[mapelIndex.AVG_FIS]) || 0) + (parseFloat(row[mapelIndex.AVG_KIM]) || 0) + (parseFloat(row[mapelIndex.AVG_BIO]) || 0);
    const totalB = (parseFloat(row[mapelIndex.AVG_EKO]) || 0) + (parseFloat(row[mapelIndex.AVG_GEO]) || 0) + (parseFloat(row[mapelIndex.AVG_INF]) || 0) + (parseFloat(row[mapelIndex.AVG_SOSIO]) || 0);
    return {
      nis: String(row[mapelIndex.NIS]),
      nama: row[mapelIndex.NAMA],
      kelas: row[mapelIndex.KELAS],
      totalA: totalA,
      totalB: totalB,
      originalData: row, // Keep original row for other details
    };
  });

  // Sort for Paket A ranks
  processedStudents.sort((a, b) => b.totalA - a.totalA);
  let currentRankA = 1;
  for (let i = 0; i < processedStudents.length; i++) {
    if (i > 0 && processedStudents[i].totalA < processedStudents[i - 1].totalA) {
      currentRankA = i + 1;
    }
    processedStudents[i].rankA = currentRankA;
  }

  // Sort for Paket B ranks
  processedStudents.sort((a, b) => b.totalB - a.totalB);
  let currentRankB = 1;
  for (let i = 0; i < processedStudents.length; i++) {
    if (i > 0 && processedStudents[i].totalB < processedStudents[i - 1].totalB) {
      currentRankB = i + 1;
    }
    processedStudents[i].rankB = currentRankB;
  }
}

// Fetch data from data.xlsx
fetch("data.xlsx")
  .then((res) => {
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.arrayBuffer();
  })
  .then((ab) => {
    const workbook = XLSX.read(ab, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    // Assuming the header is on row 4 (index 3) and data starts from row 5 (index 4)
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    dataSiswa = json.slice(4); // Start from the 5th row (index 4)
    calculateRanks(); // Calculate ranks after data is loaded
  })
  .catch((error) => {
    console.error("Error fetching or processing Excel file:", error);
    showCustomAlert("Error", "Gagal memuat data. Pastikan 'data.xlsx' ada dan formatnya benar.");
  });

// Main function to search for student data
function cariData() {
  const nisInput = document.getElementById("nisInput");
  const nis = nisInput.value.trim();
  localStorage.setItem("lastNIS", nis); // Save the last successfully searched NIS

  const hasilDiv = document.getElementById("hasil");
  const detailNilaiDiv = document.getElementById("detailNilai");
  const perhatianP = document.getElementById("perhatian");

  // Hide previous results and clear attention message
  hasilDiv.classList.add("hidden");
  detailNilaiDiv.classList.add("hidden");
  perhatianP.textContent = "";

  if (!nis) {
    showCustomAlert("Peringatan", "NIS tidak boleh kosong!");
    return;
  }

  // Find the student data by NIS in the processedStudents array
  const student = processedStudents.find((s) => s.nis === nis);

  if (!student) {
    showCustomAlert("Data Tidak Ditemukan", "Data siswa dengan NIS tersebut tidak ditemukan!");
    return;
  }

  const nama = student.nama;
  const kelas = student.kelas;
  const totalA = student.totalA;
  const totalB = student.totalB;
  const rankA = student.rankA;
  const rankB = student.rankB;
  const totalStudents = processedStudents.length;

  // Parse individual subject scores from the original data row
  const row = student.originalData;
  const AVG_MTK = parseFloat(row[mapelIndex.AVG_MTK]) || 0;
  const AVG_FIS = parseFloat(row[mapelIndex.AVG_FIS]) || 0;
  const AVG_KIM = parseFloat(row[mapelIndex.AVG_KIM]) || 0;
  const AVG_BIO = parseFloat(row[mapelIndex.AVG_BIO]) || 0;
  const AVG_EKO = parseFloat(row[mapelIndex.AVG_EKO]) || 0;
  const AVG_GEO = parseFloat(row[mapelIndex.AVG_GEO]) || 0;
  const AVG_INF = parseFloat(row[mapelIndex.AVG_INF]) || 0;
  const AVG_SOSIO = parseFloat(row[mapelIndex.AVG_SOSIO]) || 0;

  const RAPORT_MTK = parseFloat(row[mapelIndex.RAPORT_MTK]) || 0;
  const RAPORT_FIS = parseFloat(row[mapelIndex.RAPORT_FIS]) || 0;
  const RAPORT_KIM = parseFloat(row[mapelIndex.RAPORT_KIM]) || 0;
  const RAPORT_BIO = parseFloat(row[mapelIndex.RAPORT_BIO]) || 0;
  const RAPORT_EKO = parseFloat(row[mapelIndex.RAPORT_EKO]) || 0;
  const RAPORT_GEO = parseFloat(row[mapelIndex.RAPORT_GEO]) || 0;
  const RAPORT_INF = parseFloat(row[mapelIndex.RAPORT_INF]) || 0;
  const RAPORT_SOSIO = parseFloat(row[mapelIndex.RAPORT_SOSIO]) || 0;

  const PTS_MTK = parseFloat(row[mapelIndex.PTS_MTK2]) || 0;
  const PTS_FIS = parseFloat(row[mapelIndex.PTS_FIS2]) || 0;
  const PTS_KIM = parseFloat(row[mapelIndex.PTS_KIM2]) || 0;
  const PTS_BIO = parseFloat(row[mapelIndex.PTS_BIO2]) || 0;
  const PTS_EKO = parseFloat(row[mapelIndex.PTS_EKO2]) || 0;
  const PTS_GEO = parseFloat(row[mapelIndex.PTS_GEO2]) || 0;
  const PTS_INF = parseFloat(row[mapelIndex.PTS_INF2]) || 0;
  const PTS_SOSIO = parseFloat(row[mapelIndex.PTS_SOSIO2]) || 0;

  // Determine the best package
  const paketTerbaik = totalA > totalB ? "Paket A" : totalB > totalA ? "Paket B" : "Sama (Tidak ada perbedaan signifikan)";

  // Update main display elements
  document.getElementById("namaSiswa").textContent = nama;
  document.getElementById("kelasSiswa").textContent = kelas;
  document.getElementById("nilaiA").textContent = `${totalA.toFixed(2)} (Ranking: ${rankA} dari ${totalStudents} siswa)`;
  document.getElementById("nilaiB").textContent = `${totalB.toFixed(2)} (Ranking: ${rankB} dari ${totalStudents} siswa)`;
  document.getElementById("paketTerbaik").textContent = paketTerbaik;

  // Update detailed scores display elements for Raport Sem 1 and PTS Sem 2
  document.getElementById("matRaport").textContent = RAPORT_MTK.toFixed(2);
  document.getElementById("matPTS").textContent = PTS_MTK.toFixed(2);
  document.getElementById("fisRaport").textContent = RAPORT_FIS.toFixed(2);
  document.getElementById("fisPTS").textContent = PTS_FIS.toFixed(2);
  document.getElementById("kimRaport").textContent = RAPORT_KIM.toFixed(2);
  document.getElementById("kimPTS").textContent = PTS_KIM.toFixed(2);
  document.getElementById("bioRaport").textContent = RAPORT_BIO.toFixed(2);
  document.getElementById("bioPTS").textContent = PTS_BIO.toFixed(2);
  document.getElementById("ekoRaport").textContent = RAPORT_EKO.toFixed(2);
  document.getElementById("ekoPTS").textContent = PTS_EKO.toFixed(2);
  document.getElementById("geoRaport").textContent = RAPORT_GEO.toFixed(2);
  document.getElementById("geoPTS").textContent = PTS_GEO.toFixed(2);
  document.getElementById("infRaport").textContent = RAPORT_INF.toFixed(2);
  document.getElementById("infPTS").textContent = PTS_INF.toFixed(2);
  document.getElementById("sosioRaport").textContent = RAPORT_SOSIO.toFixed(2);
  document.getElementById("sosioPTS").textContent = PTS_SOSIO.toFixed(2);

  document.getElementById("hitungA").textContent = `Hitungan Paket A: ((${RAPORT_MTK.toFixed(2)}+${PTS_MTK.toFixed(2)})+(${RAPORT_FIS.toFixed(2)}+${PTS_FIS.toFixed(2)})+(${RAPORT_KIM.toFixed(2)}+${PTS_KIM.toFixed(2)})+(${RAPORT_BIO.toFixed(2)}+${PTS_BIO.toFixed(2)}))/2 = ${totalA.toFixed(2)}`;
  document.getElementById("hitungB").textContent = `Hitung Paket B: ((${RAPORT_MTK.toFixed(2)}+${PTS_MTK.toFixed(2)})+(${RAPORT_FIS.toFixed(2)}+${PTS_FIS.toFixed(2)})+(${RAPORT_KIM.toFixed(2)}+${PTS_KIM.toFixed(2)})+(${RAPORT_BIO.toFixed(2)}+${PTS_BIO.toFixed(2)}))/2 = ${totalB.toFixed(2)}`;
  document.getElementById("perhatian").textContent = `Perhatian: Ini hanya perhitungan dari seluruh data nilai siswa. Tetap optimis dengan pilihanmu 🗿`;

  // Show the result sections
  hasilDiv.classList.remove("hidden");
  detailNilaiDiv.classList.remove("hidden");
}