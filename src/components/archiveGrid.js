import React, { useEffect, useReducer } from 'react';
import Button from '@material-ui/core/Button';
import { downloadFile } from "../helpers/awsS3Handler";
import FormDialog from './uploadDialog';
import TagsInput from 'react-tagsinput'
import 'react-tagsinput/react-tagsinput.css'
import '../css/archiveGrid.css'
import { useAppContext } from "../helpers/contextLib";

export default function ArchiveGrid(state) {
    const { isAuthenticated, isAdmin } = useAppContext();
    const [data, setData] = React.useState([])
    const [tags, setTags] = React.useState([])
    const [, forceUpdate] = useReducer(x => x + 1, 0);


    const articleApi = async() =>{
        const response = await fetch(`${process.env.REACT_APP_ARTICLE_API}items`)
        return response.json()
    }

    const GridElement = ({ article }) => (
        <tr className="grid-item" title={article.articlename}>
            <td className="grid-name">
                <a href={`item/`+ article.documentid}>{article.articlename}</a>
            </td>
            <td>
                <div className="grid-tags">
                    {article.tags.map(tag => (
                        <div className='grid-tag' key={tag} onClick={() => { addTag(tag)}}>
                            {tag}
                        </div>
                    ))}
                </div>
            </td>
            <td>
                {article.year}
            </td>
            <td>
                <Button variant="outlined" color="primary" onClick={() => { navArticle(article.documentid)}}>
                    View
                </Button>
                {isAuthenticated ? (
                    <Button variant="outlined" color="primary" onClick={() => { download(article.documentid)}}>
                        download
                    </Button> ) : 
                ( '')}
            </td>
        </tr>
      );
      
    const download = (fileid) => {
        downloadFile(fileid+'.pdf').then(result => {
            window.open(result,'_blank');
        })
    }

    const navArticle  = (fileid) => {
        window.location=('/item/'+fileid)
    }

    const getData = () => {
        articleApi().then(data => {
            let filtered = data.Items.filter(item => tags.every((val) => item.tags.includes(val)))
            setData(filtered)
        })
    }

    const addTag = (tag) => {
        const eventTags = tags
        eventTags.indexOf(tag) === -1 ? eventTags.push(tag) : eventTags.splice(eventTags.indexOf(tag), 1);
        setTags(eventTags);
        forceUpdate()
    }

    useEffect(() => {
        getData()
    }, []);

    return (
        <div>
            <div className="action-bar">
                <div className="searchbar">
                    <TagsInput value={tags} onChange={setTags} />
                
                    <Button variant="outlined" color="primary" onClick={getData}>
                        Search
                    </Button>
                </div>
               
                {isAdmin ? (<FormDialog/>) : ('')}
            </div>
            <div className="grid-container">
                <table>
                    <thead>
                        <tr>
                            <th>Article Name</th>
                            <th>Tags</th>
                            <th>Published</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(article => (
                        <GridElement article={article} key={article.documentid}/>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );   
}