import React, { useEffect } from 'react';
import Button from '@material-ui/core/Button';
import { downloadFile } from "../helpers/awsS3Handler"
import { Link } from "react-router-dom";
import TextField from '@material-ui/core/TextField';
import { v4 as uuid } from "uuid";
import { useAppContext } from "../helpers/contextLib";
import "../css/archiveItem.css";

export default function ArchiveItem (state) { 
    const { isAuthenticated, isAdmin, userAttributes } = useAppContext();
    
    const [article, setArticle] = React.useState({
        year:'',
        articlename:"",
        addedby:"",
        documentid:"",
        tags:[]
    })
    const [comments, setComments] = React.useState([])
    const [commentText, setCommentText] = React.useState('')

    const articleApi = async() =>{
        const response = await fetch(`${process.env.REACT_APP_ARTICLE_API}items/${state.props.match.params.documentid}`)
        return response.json()
    }
    const commentApi = async() =>{
        const response = await fetch(`${process.env.REACT_APP_COMMENT_API}${state.props.match.params.documentid}/comments`)
        return response.json()
    }
      
    const download = (fileid) => {
        downloadFile(fileid+'.pdf').then(result => {
            window.open(result,'_blank');
        })
    }

    const submit = () => {
        const commentid = uuid();
        const postData = {
            task: 'add',
            documentid: article.documentid,
            commentid,
            commenttext: commentText.trim(),
            addedby: userAttributes.username
        }
        fetch(`${process.env.REACT_APP_COMMENT_API}${article.documentid}/comments`, {
            method: 'POST',
            body: JSON.stringify(postData),
          })
          .then(response => response)
          .then(data => {
            setCommentText('')
            getComments()
          })
          .catch(error => {
              console.error(error)
          })
    }

    const approve = (commentid) => {
        const postData = {
            task: 'approve',
            commentid,
        }
        fetch(`${process.env.REACT_APP_COMMENT_API}${article.documentid}/comments`, {
            method: 'POST',
            body: JSON.stringify(postData),
          })
          .then(response => response)
          .then(data => {
            setCommentText('')
            getComments()
          })
          .catch(error => {
              console.error(error)
          })
    }

    const onChangeComment = (e) => {
        setCommentText(e.target.value)
      };

    const getArticle = () => {
        articleApi().then(data => {
            setArticle(data.Items[0])
        })
    }

    const getComments = () => {
        commentApi().then(data => {
            setComments(data.Items)
        })
    }

    useEffect(() => {
        getArticle()
        getComments()
    }, []);

    const TagsElement = ({ tags }) => (
        <div className="article-tags">
            {tags.map(tag => (
                <div className='article-tag' key={tag} >
                    {tag}
                </div>
            ))}
        </div>
    )

    return (
        <div>
            
            <div className="article">
                <div className="return-link">
                    <Link to="/">Return to Grid</Link>
                </div>
                <div className="article-name article-element">
                    <label>Article Name:</label> {article.articlename}
                </div>
                <div className="article-tags article-element">
                    <label>Tags:</label>
                     <TagsElement tags={article.tags}/> 
                </div>
                <div className="article-year article-element">
                    <label>Published:</label> {article.year}
                </div>
                <div className="article-download">
                    {isAuthenticated ? (
                    <Button variant="outlined" color="primary" onClick={() => { download(article.documentid)}}>
                        download
                    </Button>) : ('Only logged in users may download articles')
                    }
                </div>
            </div>
            <div className='comment-section'>
                <div className='comment-header'>Comments:</div>
                {isAuthenticated ? (
                    <div>
                        <div className='comment-textfield'>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="year"
                                label="Add New comment"
                                type="text"
                                value={commentText}
                                onChange={onChangeComment}
                                fullWidth
                                multiline
                            />
                        </div>
                        <div className='comment-submit'>
                            <Button onClick={submit} style={{ display: (commentText.trim() !== '' ? 'block' : 'none') }} color="primary">
                                Submit
                            </Button>
                        </div>
                    </div>
                ) : ( 
                    <div className='comment-loggedout'>
                        Only logged in users may leave a comment.
                    </div>
                ) }

                {comments.map(comment => (
                    comment.approved || isAdmin ? (
                    <div className='user-comment' key={comment.commentid}>
                        {!comment.approved ? (
                            <Button onClick={() => { approve(comment.commentid)}} className='comment-approve' color="primary">
                                    approve
                            </Button>) : ('')
                        }
                        <div className='comment-context'>{comment.addedby}: 
                            <div className='comment-date'>{comment.dateadded}</div>
                        </div>
                        <div className='comment-text'>{comment.commenttext}</div>
                    </div>
                    ) : ('')
                ))}
            </div>
        </div>
    );
}