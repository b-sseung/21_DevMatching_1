import ImageView from './ImageView.js';
import Breadcrumb from './Breadcrumb.js';
import Nodes from './Nodes.js';
import { request } from './api.js';
import Loading from './Loading.js';


const cache = {};

export default function App($app) {
	this.state = {
    	isRoot: true,
        nodes: [],
        depth: [],
        selectedFilePath: null,
        isLoading: true
    }
    
    const breadcrumb = new Breadcrumb({
    	$app,
        initialState: this.state.depth,
        onClick: (index) => {
            if (index === null) {
                this.setState({
                    ...this.state,
                    depth: [],
                    isRoot: true,
                    nodes: cache.root
                })
            } else {
                if (index === this.state.depth.length - 1) return;

                const nextState = {...this.state};
                const nextDepth = this.state.depth.slice(0, index+1);

                this.setState({
                    ...nextState,
                    depth: nextDepth,
                    isRoot: false,
                    nodes: cache[nextDepth[nextDepth.length - 1].id]
                })
            }
        }
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
                    if (cache[node.id]) {
                        this.setState({
                            ...this.state,
                            isRoot: false,
                            depth: [...this.state.depth, node],
                            nodes: cache[node.id]
                        });
                    } else {
                        const nextNodes = await request(node.id);
                        this.setState({
                            ...this.state,
                            isRoot: false,
                            depth: [...this.state.depth, node],
                            nodes: nextNodes
                        });
                        cache[node.id] = nextNodes;
                    }
                } else if (node.type === 'FILE') {
                    this.setState({
                        ...this.state,
                        isRoot: false,
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
                    this.setState({
                        ...nextState,
                        isRoot: true,
                        nodes: cache.root
                    })
                } else {
                    this.setState({
                        ...nextState,
                        isRoot: false,
                        nodes: cache[prevNodeId],
                    })
                }
            } catch (e) {
                //에러 처리
            }
        }
    })

    const imageView = new ImageView({
        $app,
        initialState: this.state.selectedNodeImage,
        onClick: async () => {
            this.setState({
                selectedFilePath: null
            })
        }
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
        this.state.selectedFilePath = null;
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

            cache.root = rootNodes;
        } catch (e) {
            //에러처리 하기
        }
    }

    init();
}