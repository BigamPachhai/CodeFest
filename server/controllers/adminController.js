import Problem from '../models/Problem.js';
import User from '../models/User.js';
import PDFDocument from 'pdfkit';

export const getAdminStats = async (req, res) => {
  try {
    const totalProblems = await Problem.countDocuments();
    const resolvedProblems = await Problem.countDocuments({ status: 'resolved' });
    const pendingProblems = await Problem.countDocuments({ status: 'pending' });
    const inProgressProblems = await Problem.countDocuments({ status: 'in_progress' });

    const problemsByCategory = await Problem.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          }
        }
      }
    ]);

    const problemsByMunicipality = await Problem.aggregate([
      {
        $group: {
          _id: '$location.municipality',
          count: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          }
        }
      }
    ]);

    const monthlyStats = await Problem.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          reported: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          total: totalProblems,
          resolved: resolvedProblems,
          pending: pendingProblems,
          inProgress: inProgressProblems,
          resolutionRate: totalProblems > 0 ? (resolvedProblems / totalProblems * 100).toFixed(2) : 0
        },
        byCategory: problemsByCategory,
        byMunicipality: problemsByMunicipality,
        monthlyStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin statistics',
      error: error.message
    });
  }
};

export const generateProblemReport = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id)
      .populate('reporter', 'name email')
      .populate('assignedTo', 'name department');

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=problem-${problem._id}.pdf`);

    doc.pipe(res);

    // Header
    doc.fontSize(20)
       .fillColor('#2E86AB')
       .text('Rupandehi District Problem Report', 50, 50)
       .moveDown();

    // Problem Details
    doc.fontSize(12)
       .fillColor('#000000')
       .text(`Report ID: ${problem._id}`, { continued: false })
       .text(`Title: ${problem.title}`)
       .text(`Category: ${problem.category.toUpperCase()}`)
       .text(`Status: ${problem.status.replace('_', ' ').toUpperCase()}`)
       .text(`Priority: ${problem.priority.toUpperCase()}`)
       .text(`Reported on: ${problem.createdAt.toLocaleDateString('en-NP')}`)
       .moveDown();

    // Location
    doc.text('Location Details:')
       .text(`Municipality: ${problem.location.municipality}`)
       .text(`Ward: ${problem.location.ward}`)
       .text(`Exact Location: ${problem.location.exactLocation}`)
       .moveDown();

    // Description
    doc.text('Problem Description:')
       .text(problem.description, { width: 500 })
       .moveDown();

    // Reporter Info
    if (!problem.isAnonymous) {
      doc.text('Reporter Information:')
         .text(`Name: ${problem.reporter.name}`)
         .text(`Email: ${problem.reporter.email}`)
         .moveDown();
    }

    // Resolution Details
    if (problem.status === 'resolved' && problem.resolutionDetails) {
      doc.text('Resolution Details:')
         .text(`Resolved on: ${problem.resolutionDetails.resolvedAt.toLocaleDateString('en-NP')}`)
         .text(`Resolution: ${problem.resolutionDetails.resolutionDescription}`)
         .moveDown();
    }

    // Footer
    doc.fontSize(10)
       .fillColor('#666666')
       .text(`Generated on: ${new Date().toLocaleDateString('en-NP')}`, 50, doc.page.height - 100);

    doc.end();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating PDF report',
      error: error.message
    });
  }
};

export const updateProblemStatus = async (req, res) => {
  try {
    const { status, assignedTo, priority, resolutionDetails } = req.body;

    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    if (status) problem.status = status;
    if (assignedTo) problem.assignedTo = assignedTo;
    if (priority) problem.priority = priority;
    
    if (status === 'resolved' && resolutionDetails) {
      problem.resolutionDetails = {
        ...resolutionDetails,
        resolvedAt: new Date(),
        resolvedBy: req.user.id
      };

      // Award points to reporter
      await User.findByIdAndUpdate(problem.reporter, {
        $inc: { points: 10 }
      });
    }

    await problem.save();

    res.status(200).json({
      success: true,
      data: {
        problem
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating problem status',
      error: error.message
    });
  }
};