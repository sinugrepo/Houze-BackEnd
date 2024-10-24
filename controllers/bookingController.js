const cloudinary = require("../config/cloudinaryConfig");
const { PrismaClient } = require("@prisma/client");
const transporter = require("../config/nodemailerConfig");
const prisma = new PrismaClient();
const { createEventBooking } = require('./calendarController'); 

const dayjs = require("dayjs");
const weekday = require("dayjs/plugin/weekday");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
require("dayjs/locale/id"); // Import locale Bahasa Indonesia

dayjs.extend(weekday);
dayjs.extend(utc);
dayjs.extend(timezone);

const {
  sendSuccess,
  sendError,
  sendSuccessGetPaginationData,
} = require("../utils/baseResponse");
const { getToday, getTodayRange } = require("../utils/dateUtils");

const generateBookingId = async () => {
  let newBookingId;
  let isUnique = false;

  while (!isUnique) {
    // Membuat angka acak 1000-9999
    const randomNumber = Math.floor(10000 + Math.random() * 90000);

    // Menyisipkan huruf di antara angka acak (misalnya: "HZ" di awal dan "S" di akhir)
    const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const randomLetterMiddle = randomChars.charAt(
      Math.floor(Math.random() * randomChars.length)
    );

    newBookingId = `HZ${randomNumber}${randomLetterMiddle}S`;

    // Cek apakah ID ini sudah ada di database
    const existingBooking = await prisma.booking.findUnique({
      where: { id: newBookingId },
    });

    // Jika tidak ditemukan booking dengan ID ini, artinya ID unik
    if (!existingBooking) {
      isUnique = true;
    }
  }

  return newBookingId;
};

const createBooking = async (req, res) => {
  const {
    account_name,
    account_number,
    payment_method,
    transfer_nominal,
    customer_name,
    email,
    phone_number,
    person,
    price,
    notes,
    schedule,
    catalog_id,
  } = req.body;
  try {
    const imageUpload = await cloudinary.uploader.upload(req.file.path, {
      folder: "payments",
    });

    const status = "Pending";

    const payment = await prisma.payment.create({
      data: {
        account_name,
        account_number,
        payment_method,
        status: status,
        transfer_nominal: parseFloat(transfer_nominal),
        img_url: imageUpload.secure_url,
        created_at: getToday(),
        updated_at: getToday(),
      },
    });

    // const latestBooking = await prisma.booking.findFirst({
    //   orderBy: { id: "desc" },
    // });

    // let newBookingId = "B0001";
    // if (latestBooking) {
    //   const lastIdNumber = parseInt(latestBooking.id.slice(1));
    //   const newIdNumber = lastIdNumber + 1;
    //   newBookingId = `B${newIdNumber.toString().padStart(4, "0")}`;
    // }
    const catalog = await prisma.catalog.findUnique({
      where: {
        id: catalog_id,
      },
    });

    if (!catalog) {
      return sendError(res, "Catalog not found", 404);
    }

    // Menggunakan catalog_name di dalam kode
    const catalogName = catalog.catalog_name;

    const booking_status = "Booked";
    const idBooking = await generateBookingId();
    const bookings = await prisma.booking.create({
      data: {
        id: idBooking,
        customer_name,
        payment_id: payment.id,
        email,
        phone_number,
        person: parseInt(person),
        price: parseFloat(price),
        notes,
        schedule: new Date(schedule),
        booking_status: booking_status,
        created_at: getToday(),
        updated_at: getToday(),
        catalog_id: catalog_id,
      },
    });
    console.log(schedule, " dan ", bookings.schedule);
    const calendarSchedule = new Date(schedule.replace("Z", ""));
    // Create a calendar event
    await createEventBooking({
      summary: `Booking: ${catalogName} for ${customer_name} ID:${idBooking}`,
      description: `Booking ID: ${idBooking}, Notes: ${notes}, Price: ${price}`,
      startTime: new Date(calendarSchedule),
      endTime: new Date(new Date(calendarSchedule).getTime() + 10 * 60 * 1000), // 10 minutes duration
    });

    // Konfigurasi email konfirmasi
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Booking Confirmation ${idBooking}`,
      html: mailMessage(
        idBooking,
        catalogName,
        bookings.schedule,
        bookings.created_at,
        bookings.price,
        bookings.customer_name,
        bookings.person
      ),
    };
    await transporter.sendMail(mailOptions);

    return sendSuccess(res, { bookings, payment }, "Booking Success");
  } catch (error) {
    console.error(error);
    return sendError(res, error);
  }
};

const mailMessage = (
  pIdBooking,
  pCatalogName,
  pSchedule,
  pCreatedAt,
  pPrice,
  pCustomerName,
  pPerson
) => {
  console.log(pSchedule);
  const formatSchedule = (pSchedule) => {
    return dayjs
      .utc(pSchedule) // Gunakan UTC parsing untuk memastikan waktu tidak dikonversi
      .locale("id") // Set locale ke Bahasa Indonesia
      .format("dddd, DD MMMM YYYY HH:mm [WIB]"); // Format sesuai keinginan
  };

  // Contoh penggunaan
  const formattedSchedule = formatSchedule(pSchedule);
  console.log(formattedSchedule);
  return `<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Houze Studio - Booking Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #ffffff;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
        }
        .header {
            text-align: center;
            padding: 20px 0;
            background-color: #ffffff;
        }
        .header img {
            max-width: 120px;
            margin-bottom: 10px;
        }
        .header h2 {
            margin: 0;
            font-size: 24px;
            color: #333;
        }
        .content {
            padding: 20px 0;
        }
        .content h2 {
            font-size: 22px;
            margin-bottom: 20px;
            color: #333;
        }
        .details {
            font-size: 16px;
            color: #555;
        }
        .summary {
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
        }
        .summary h3 {
            font-size: 20px;
            margin-bottom: 15px;
            color: #333;
        }
        .summary-table {
            width: 100%;
            border-collapse: collapse;
        }
        .summary-table td {
            padding: 8px 0;
            font-size: 16px;
            color: #333;
        }
        .summary-table .label {
            width: 70%;
            text-align: left;
        }
        .summary-table .amount {
            width: 30%;
            text-align: right;
        }
        .footer {
            text-align: center;
            padding: 20px 0;
            background-color: #ffffff;
        }
        .footer a {
            text-decoration: none;
            color: #25D366;
            font-size: 16px;
        }
        .footer p {
            font-size: 14px;
            margin: 5px 0;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://i.ibb.co/9NNC7dY/image.png" alt="Houze Studio Logo">
            <h2>Pemesanan Anda Berhasil!</h2>
            <p>Terima kasih atas kepercayaan Anda.</p>
        </div>
        <div class="content">
            <h2>Detail Pemesanan</h2>
            <div class="details">
                <p><strong>Pelanggan:</strong> ${pCustomerName}</p>
                <p><strong>Studio:</strong> ${pCatalogName}</p>
                <p><strong>Tanggal:</strong> ${formattedSchedule}</p>
                <p><strong>ID Booking:</strong> ${pIdBooking}</p>
            </div>
            <h3>Ringkasan Pembelian</h3>
            <div class="summary">
                <table class="summary-table">
                    <tr>
                        <td class="label">${pCatalogName} (${pPerson} Orang)</td>
                        <td class="amount">IDR ${pPrice}</td>
                    </tr>
                    <tr>
                        <td class="label">Subtotal</td>
                        <td class="amount">IDR ${pPrice}</td>
                    </tr>
                    <tr>
                        <td class="label">Booking Fee</td>
                        <td class="amount">IDR 0</td>
                    </tr>
                    <tr>
                        <td class="label" style="font-weight: bold;">Total Pembayaran</td>
                        <td class="amount" style="font-weight: bold;">IDR ${pPrice}</td>
                    </tr>
                </table>
            </div>
            <p>Dipesan pada: ${pCreatedAt}</p>
        </div>
        <div class="footer">
            <p>Hubungi Kami via WhatsApp: *Klik nomor maka akan terarahkan ke Whatsapp</p>
            <a href="https://api.whatsapp.com/send?phone=6285161237779&text=Saya%20perlu%20bantuan%20terkait%20booking%2C%20tolong%20dibantu!">
                +62 8516-1237-779 (WhatsApp)
            </a>
            <p>&copy; 2024 Houze Studio. All rights reserved.</p>
            <p>Jl. Ahmad Yani, Ruko Tanjlig No. 5, Purwokerto Barat, Jawa Tengah 53131</p>
        </div>
    </div>
</body>
</html>
`;
};

const getBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    const bookings = await prisma.booking.findMany({
      skip,
      take,
      orderBy: { id: "desc" },
      include: {
        payment: true,
      },
    });

    const totalItems = await prisma.booking.count();

    const normalizedResponse = bookings.map((booking) => ({
      booking_id: booking.id,
      customer_name: booking.customer_name,
      email: booking.email,
      phone_number: booking.phone_number,
      price: booking.price,
      schedule: booking.schedule,
      notes: booking.notes,
      booking_status: booking.booking_status,
      catalog_id: booking.catalog_id,
      payment_id: booking.payment_id,
      account_name: booking.payment.account_name,
      account_number: booking.payment.account_number,
      payment_method: booking.payment.payment_method,
      transfer_nominal: booking.payment.transfer_nominal,
      payment_status: booking.payment.status,
    }));

    return sendSuccessGetPaginationData(
      res,
      page,
      limit,
      totalItems,
      normalizedResponse,
      "Success"
    );
  } catch (error) {
    console.error(error);
    return sendError(res, "Failed to retrieve bookings", 500);
  }
};

const getBookingsByUser = async (req, res) => {
  try {
    const { page = 1, limit = 10, date } = req.query;

    const skip = (page - 1) * limit;
    const take = parseInt(limit);
    const startDate = dayjs(date).startOf("day").toDate();
    const endDate = dayjs(date).endOf("day").toDate();

    const bookings = await prisma.booking.findMany({
      skip,
      take,
      orderBy: { id: "desc" },
      include: {
        payment: true,
      },
      where: {
        schedule: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalItems = await prisma.booking.count({
      where: {
        schedule: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const normalizedResponse = bookings.map((booking) => ({
      booking_id: booking.id,
      schedule: booking.schedule,
    }));

    return sendSuccessGetPaginationData(
      res,
      page,
      limit,
      totalItems,
      normalizedResponse,
      "Success"
    );
  } catch (error) {
    console.error(error);
    return sendError(res, "Failed to retrieve bookings", 500);
  }
};

const getBookingById = async (req, res) => {
  try {
    const { booking_id } = req.params;
    const booking = await prisma.booking.findUnique({
      where: {
        id: booking_id,
      },
      include: {
        payment: true,
      },
    });

    if (!booking) {
      return sendError(res, "Booking not found", 404);
    }

    const normalizedResponse = {
      booking_id: booking.id,
      customer_name: booking.customer_name,
      email: booking.email,
      phone_number: booking.phone_number,
      price: booking.price,
      schedule: booking.schedule,
      notes: booking.notes,
      booking_status: booking.booking_status,
      catalog_id: booking.catalog_id,
      payment_id: booking.payment_id,
      account_name: booking.payment.account_name,
      account_number: booking.payment.account_number,
      payment_method: booking.payment.payment_method,
      transfer_nominal: booking.payment.transfer_nominal,
      payment_status: booking.payment.status,
    };

    return sendSuccess(res, normalizedResponse, "Success");
  } catch (error) {
    console.error(error);
    return sendError(res, "Failed to retrieve booking", 500);
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { booking_id, booking_status, payment_status } = req.body;
    const booking = await prisma.booking.update({
      where: {
        id: booking_id,
      },
      data: {
        booking_status,
        updated_at: getToday(),
        payment: {
          update: {
            status: payment_status,
            updated_at: getToday(),
          },
        },
      },
      include: {
        payment: true,
      },
    });

    return sendSuccess(res, booking, "Success");
  } catch (error) {
    console.error(error);
    return sendError(res, "Failed to update booking status", 500);
  }
};

const getTotalBooking = async (req, res) => {
  try {
    const { startOfToday, endOfToday } = getTodayRange();

    const totalBooking = await prisma.booking.count();
    const todayBooking = await prisma.booking.count({
      where: { created_at: { gte: startOfToday, lte: endOfToday } },
    });
    const completedBooking = await prisma.booking.count({
      where: { booking_status: "Completed" },
    });
    const pendingBooking = await prisma.booking.count({
      where: { booking_status: "Booked" },
    });
    const canceledBooking = await prisma.booking.count({
      where: { booking_status: "Canceled" },
    });

    const acumulatedData = {
      totalBookings: totalBooking,
      todayBookings: todayBooking,
      completedBookings: completedBooking,
      pendingBookings: pendingBooking,
      canceledBookings: canceledBooking,
    };

    return sendSuccess(res, acumulatedData, "Get total booking data success");
  } catch (error) {
    console.error(error);
    return sendError(res, "Failed to get total booking", 500);
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingsByUser,
  getBookingById,
  updateBookingStatus,
  getTotalBooking,
};
