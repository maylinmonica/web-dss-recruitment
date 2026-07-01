const { pool } = require('../db');
const { readCriteria, saveCriteria } = require('../dataStore');

/**
 * Request Handler: Retrieves current criteria configuration.
 * Fetches weighting and attribute parameters from the local JSON datastore.
 */
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

/**
 * Request Handler: Updates criteria weights and attributes configuration.
 * Validates absolute boundary allocations before persisting to the local data store.
 * Restricted to HR Manager clearance level.
 */
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
        // Constraint Validation: Ensures the aggregated weight accumulation equals exactly 100% (1.0)
        const totalWeight = Object.values(weights).reduce((sum, value) => sum + parseFloat(value), 0);
        
        // Precision Handling: Utilizes epsilon decimal tolerance to mitigate JavaScript floating-point arithmetic rounding anomalies
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

        // Persistence Routine: Commits the validated criteria configuration state overwriting the previous rule mapping
        const updatedConfig = { weights, attributes };
        saveCriteria(updatedConfig);

        return res.status(200).json({
            status: "Success",
            ui_notice: {
                title: "Konfigurasi Diperbarui",
                description: "Bobot kepentingan kriteria berhasil diubah. Seluruh matriks peringkat evaluasi otomatis menyesuaikan.",
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