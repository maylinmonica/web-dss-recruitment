const { readCriteria, saveCriteria } = require('../dataStore');

// 1. GET: Mengambil konfigurasi kriteria saat ini
exports.getCriteria = async (req, res) => {
    try {
        const criteria = readCriteria();
        return res.status(200).json({
            status: "Success",
            data: criteria
        });
    } catch (error) {
        return res.status(500).json({
            status: "Error",
            ui_notice: {
                title: "Gagal Memuat Kriteria",
                description: "Terjadi kesalahan internal saat mengambil data kriteria.",
                type: "error"
            },
            error: error.message
        });
    }
};

// 2. PUT: Memperbarui bobot dan atribut kriteria (Fungsi HR Manager)
exports.updateCriteria = async (req, res) => {
    const { weights, attributes } = req.body;

    if (!weights || !attributes) {
        return res.status(400).json({
            status: "Fail",
            ui_notice: {
                title: "Data Tidak Lengkap",
                description: "Struktur data bobot dan atribut kriteria baru wajib disertakan.",
                type: "warning"
            }
        });
    }

    try {
        // Validasi Akumulasi Nilai Bobot Wajib 100% (1.0)
        const totalWeight = Object.values(weights).reduce((sum, value) => sum + parseFloat(value), 0);
        
        // Menggunakan toleransi desimal untuk menghindari pembulatan javascript floating-point
        if (Math.abs(totalWeight - 1.0) > 0.0001) {
            return res.status(400).json({
                status: "Fail",
                ui_notice: {
                    title: "Kalkulasi Bobot Salah",
                    description: `Akumulasi total bobot kriteria harus tepat bernilai 100% (1.0). Total input saat ini: ${(totalWeight * 100).toFixed(0)}%`,
                    type: "error"
                }
            });
        }

        const updatedConfig = { weights, attributes };
        saveCriteria(updatedConfig);

        return res.status(200).json({
            status: "Success",
            ui_notice: {
                title: "Konfigurasi Diperbarui",
                description: "Bobot kepentingan kriteria berhasil diubah. Seluruh peringkat TOPSIS otomatis menyesuaikan.",
                type: "success"
            },
            data: updatedConfig
        });

    } catch (error) {
        return res.status(500).json({
            status: "Error",
            ui_notice: {
                title: "Gagal Memperbarui",
                description: "Terjadi kesalahan sistem saat menyimpan konfigurasi kriteria baru.",
                type: "error"
            },
            error: error.message
        });
    }
};