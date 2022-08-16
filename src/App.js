import ImageView from './ImageView.js';
import Breadcrumb from './Breadcrumb.js';
import Nodes from './Nodes.js';
import { request } from './api.js';
import Loading from './Loading.js';


const cache = {};

export default function App($app) {
	this.state = {
    	isRoot: false,
        nodes: [],
        depth: [],
        selectedFilePath: null,
        isLoading: true
    }
    
    const breadcrumb = new Breadcrumb({
    	$app,
        initialState: this.state.depth
    })
    
    const nodes = new Nodes({
    	$app,
        initialState: {
        	isRoot: this.state.isRoot,
            nodes: this.state.nodes
        },
        onClick: async (node) => {
            try {
                if (node.type === 'DIRECTORY') {
                    const nextNodes = await request(node.id);
                    this.setState({
                        ...this.state,
                        isRoot: true,
                        depth: [...this.state.depth, node],
                        nodes: nextNodes
                    });
                } else if (node.type === 'FILE') {
                    this.setState({
                        ...this.state,
                        isRoot: true,
                        selectedFilePath: node.filePath
                    })
                }
            } catch (e) {
                //에러처리하기
            }
        },
        onBackClick: async() => {
            try {
                const nextState = {...this.state};
                nextState.depth.pop();

                const prevNodeId = nextState.depth.length === 0 ? null : nextState.depth[nextState.depth.length - 1].id;
                console.log("이건가:"+prevNodeId);
                if (prevNodeId === null) {
                    const rootNodes = await request();
                    this.setState({
                        ...nextState,
                        isRoot: false,
                        nodes: rootNodes
                    })
                } else {
                    const prevNodes = await request(prevNodeId);

                    this.setState({
                        ...nextState,
                        isRoot: true,
                        nodes: prevNodes
                    })
                }
            } catch (e) {
                //에러 처리
            }
        }
    })

    const imageView = new ImageView({
        $app,
        initialState: this.state.selectedNodeImage
    })

    const loading = new Loading({
        $app,
        initialState: this.state.isLoading
    });

    this.setState = (nextState) => {
        this.state = nextState;
        breadcrumb.setState(this.state.depth);
        nodes.setState({
            isRoot: this.state.isRoot,
            nodes: this.state.nodes
        });
        imageView.setState(this.state.selectedFilePath);
        loading.setState(this.state.isLoading);
    }

    const init = async () => {
        try {
            const rootNodes = await request();
            this.setState({
                ...this.state,
                isRoot: this.state.isRoot,
                nodes: rootNodes,
                isLoading: false
            });
        } catch (e) {
            //에러처리 하기
        }
    }

    init();
}