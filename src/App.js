import ImageView from './ImageView.js';
import Breadcrumb from './Breadcrumb.js';
import Nodes from './Nodes.js';
import { request } from './api.js';

export default function App($app) {
	this.state = {
    	isRoot: true,
        nodes: [],
        depth: [],
        selectedFilePath: null
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
                        depth: [...this.state.depth, node],
                        nodes: nextNodes
                    });
                } else if (node.type === 'FILE') {
                    this.setState({
                        ...this.state,
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

                if (prevNodeId === null) {
                    const rootNodes = await request();
                    this.setState({
                        ...nextState,
                        isRoot: true,
                        nodes: rootNodes
                    })
                } else {
                    const prevNodes = await request(prevNodeId);

                    this.setState({
                        ...nextNodes,
                        isRoot: false,
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

    this.setState = (nextState) => {
        this.state = nextState;
        breadcrumb.setState(this.state.depth);
        nodes.setState({
            isRoot: this.state.isRoot,
            nodes: this.state.nodes
        });
        imageView.setState(this.state.selectedFilePath);
    }

    const init = async () => {
        try {
            const rootNodes = await request();
            this.setState({
                ...this.state,
                isRoot: true,
                nodes: rootNodes
            });
        } catch (e) {
            //에러처리 하기
        }
    }

    init();
}