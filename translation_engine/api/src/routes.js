const express = require('express');
const fileUpload = require('express-fileupload');
const router = express.Router();
const pool = require("./db");
const path = require('path');
router.use(fileUpload({createParentPath: true}));


router.get('/', (req, res) => {
    res.send('untertitle API listening...')
})

router.get('/job/:id', async (req, res) => {

    //Was there no data passed to post
    if (!req.body) return res.sendStatus(400)

    let data = null;
    const id = req.params.id;

    //Setup db connection
    let conn;

    try {
        conn = await pool.getConnection();
        const job = await conn.query("SELECT \n" +
            "\tj.id, \n" +
            "    j.label, \n" +
            "    j.source_language_id, \n" +
            "    j.target_language_id, \n" +
            "    j.created,\n" +
            "    j.last_updated,\n" +
            "    j.overall_rating,\n" +
            "    j.job_state_id,\n" +
            "    s.label as job_state_text\n" +
            "FROM\n" +
            "\tjob j,\n" +
            "    job_state s\n" +
            "WHERE\n" +
            "\ts.id = j.job_state_id\n" +
            "AND\n" +
            "\tj.id = (?);"
            , [id]);
        if (job.length === 0) {
            throw new Error(`Job not found`);
        }
        const jobFiles = await conn.query("SELECT * FROM job_file WHERE job_id = (?)", [id]);
        const jobSegments = await conn.query("SELECT * FROM job_segment WHERE job_id = (?)", [id]);
        const jobUserSegments = await conn.query("SELECT * FROM job_segment_user WHERE job_id = (?)", [id]);

        // create result object
        let completeJob = job[0];
        completeJob['files'] = jobFiles;
        completeJob['segments'] = jobSegments;
        completeJob['userSegments'] = jobUserSegments

        // return result
        res.send({
            status: 200,
            data: completeJob
        });
    } catch (err) {
        // console.log(error);
        return res.status(400).send({
            message: '' + err
        });
    } finally {
        if (conn) {
            conn.release();
            console.log('------connection release');
        }
    }
})

//Changed Query in Tara's Code for Jobs
router.get('/jobs', async (req, res) => {
    //Setup db connection
    let conn;
    try {
        // get a connection from the pool
        conn = await pool.getConnection();
        const result = await conn.query("SELECT \n" +
            "\tj.id, \n" +
            "    j.label, \n" +
            "    j.source_language_id, \n" +
            "    j.target_language_id, \n" +
            "    j.created,\n" +
            "    j.last_updated,\n" +
            "    j.overall_rating,\n" +
            "    j.job_state_id,\n" +
            "    s.label as job_state_text\n" +
            "FROM\n" +
            "\tjob j,\n" +
            "    job_state s\n" +
            "WHERE\n" +
            "\ts.id = j.job_state_id;");
        // return results
        res.send({
            status: 200,
            data: result
        });
    } catch (err) {
        throw err;
    } finally {
        if (conn) {
            conn.release();
        }
    }
})

router.get('/schema/version', async (req, res) => {
    //Setup db connection
    let conn;
    try {
        //Get a coonection from the pool
        conn = await pool.getConnection();
        //Build version query
        const result = await conn.query("SELECT release_version FROM untertitle_db.schema_release LIMIT 1;");

        // return result
        res.send({
            status: 200,
            data: result[0] //Get first result from response so a array is not returned
        });
    } catch (err) {
        throw err;
    } finally {
        if (conn) {
            conn.release();
            console.log('------connection release');
        }
    }
})


router.post('/job/', async (req, res) => {

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    try {

        const sourceLanguage = req.body.sourcelanguage;
        const targetLanguage = req.body.targetlanguage;
        const label = req.body.label ? req.body.label : 'Unnamed Job ' + Math.random().toString(36).substring(2, 8).toUpperCase();

        const conn = await pool.getConnection();

        const createJobSql = `INSERT INTO job (label, source_language_id, target_language_id, created, last_updated)
                              VALUES (?, ?, ?, NOW(), NOW())`;

        await conn.query(createJobSql, [label, sourceLanguage, targetLanguage]).then(async (result) => {
            const jobId = result.insertId;

            // handle file upload
            const file = req.files.file;
            const fileExtension = path.parse(file.name).ext;
            const fileName = `untertitle_${jobId}_in${fileExtension}`;
            const uploadPath = `/untertitle-media/${jobId}/${fileName}`;

            await file.mv(uploadPath);

            // add file entry in database
            const createFileSql = `INSERT INTO job_file (job_id, label, filename, is_input_file)
                                   VALUES (?, ?, ?, ?)`;
            const createFileResult = await conn.query(createFileSql, [jobId, "Uploaded Video", fileName, 1]);

            // update job state
            const updateJobSql = `UPDATE job SET job_state_id = 20 WHERE id = ?`;
            const updateJobResult =  await conn.query(updateJobSql, [jobId]);

            res.send({
                status: 200,
                data: {'message': 'Job created with id ' + jobId} //Return number of records affected
            })
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send('Error during upload.' + error.message);
    }
});

//Test - Updating job rating :id
router.get('/test-jobrating/:id', (req, res) => {
    const id = req.params.id
    res.send(`
  <div>
  <h3>Post a job rating to a job</h3>
  <br>
  <form method='POST' action='../job/${id}/rating'>
    <div>
      <div>
        <label for="rating">Rating</label>
      </div>
      <input type='number' id='rating' name='rating' min="0" max="6">
    </div>
    <div>
      <button>Update</button>
    </div>
  </form>
</div>
  `)
})


// Test - Updating job rating first id
router.get('/test-jobrating', (req, res) => {
    const id = '1'
    res.send(`
  <div>
  <h3>Post a job rating to a job</h3>
  <br>
  <form method='POST' action='./job/${id}/rating'>
    <div>
      <div>
        <label for="rating">Rating</label>
      </div>
      <input type='number' id='rating' name='rating' min="0" max="6">
    </div>
    <div>
      <button>Update</button>
    </div>
  </form>
</div>
  `)
})


router.post('/job/:id/rating', async (req, res) => {


    //Was there no data passed to post
    if (!req.body) return res.sendStatus(400)

    //Setup variables to hold the post data
    const id = req.params.id
    let rating = req.body.rating;

    //Check if rating is a number
    if (isNaN(rating)) {
        return res.status(400).send({
            message: 'Rating ' + rating + ' is not a number.Please make sure rating is a valid number in range of 1 to 5.'
        });
    }

    //Check if rating is in within required range
    if (!(rating > 0 && rating < 6)) {
        return res.status(400).send({
            message: 'Rating ' + rating + ' is not a valid number in range of 1 to 5.'
        });
    }

    //Setup db connection
    let conn;
    let job = null;

    try {

        //Get a connection from the pool
        conn = await pool.getConnection();

        // Try Catch for query to check if job exists in db
        try {

            //Build job query
            const job = await conn.query("SELECT * FROM  job WHERE id = (?)", [id]);

            //Was job found in db
            if (job.length == 0) {
                throw new Error(`Job with id of '${id}' not found`);
            }


        } catch (err) {

            throw err;
        }


        let updateJobRes = null;


        // Try Catch for updating job rating value
        try {

            // update statment
            let sql = `UPDATE job
                       SET overall_rating = (?)
                       WHERE id = (?)`;


            updateJobRes = await conn.query(sql, [rating, id]);

            // return result
            res.send({
                status: 200,
                data: {'Rows affected:': updateJobRes.affectedRows} //Return number of records affected
            });


        } catch (err) {

            throw new Error(`Failed to post rating '${rating}' to job id of '${id}' reason '${err}' `);
        }

    } catch (err) {

        return res.status(400).send({
            message: '' + err
        });

    } finally {
        if (conn) {
            conn.release();
            console.log('------connection release');
        }
    }
})

router.get('/fs/', (req, res) => {
    let fs = require('fs')
    let d = new Date()
    fs.appendFile('/untertitle-media/test.txt', d.toString() + "\r\n", function (err) {
        if (err) throw err;
        console.log('file modified!')
        res.send('done!')
    })
})

module.exports = router