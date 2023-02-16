import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Button, Image, Modal } from 'react-native';
import { Camera } from 'expo-camera';
import { Video } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import Icon from 'react-native-vector-icons/AntDesign'

let timer = null;
let ss = 0;


const AppCameraVideo = ({ onChange, closeCamera, openCamera, VideoQuality, maxDuration, maxFileSize }) => {

    const [hasAudioPermission, setHasAudioPermission] = useState(null);
    const [hasCameraPermission, setHasCameraPermission] = useState(null);
    const [camera, setCamera] = useState(null);
    const [record, setRecord] = useState(null);
    const [type, setType] = useState(Camera.Constants.Type.back);
    const video = React.useRef(null);
    const [status, setStatus] = React.useState({});
    const camRef = useRef(null);
    const [disableButtonGravar, setDisableButtonGravar] = useState(false);
    const [capturedPhoto, setCapturedPhoto] = useState(null);
    /* Estados dos Modias*/
    const [modalViewVideo, setModalViewVideo] = useState(false);
    //const [modalOpenCamera, setModalOpenCamera] = useState(true);
    const [modalOpenVideo, setModalOpenVideo] = useState(false);
    const [openModalReviewImage, setOpenModalReviewImage] = useState(false);
    /* Dados dos Arquivos*/
    const [dataImagem, setDataImagem] = useState(null);
    const [dataVideo, setDataVideo] = useState(null);
    const [numero, setNumero] = useState(0);
    const [ultimo, setUltimo] = useState(null);

    useEffect(() => {
        (async () => {
            const cameraStatus = await Camera.requestCameraPermissionsAsync();
            setHasCameraPermission(cameraStatus.status === 'granted');

            const audioStatus = await Camera.requestMicrophonePermissionsAsync();
            setHasAudioPermission(audioStatus.status === 'granted');

        })();
    }, []);

    /* Funções para Video*/
    const takeVideo = async () => {
        if (camera) {
            const data = await camera.recordAsync({
                VideoQuality: VideoQuality,
                maxDuration: maxDuration,
                maxFileSize: maxFileSize,
            })
            let fileInfo = await FileSystem.getInfoAsync(data.uri);
            // console.log('data')
            // console.log(data);
            // console.log('fileInfo')
            // console.log(fileInfo)
            setDataVideo(fileInfo);
            console.log(data.uri)
            setRecord(data.uri);
        }
    }
    const stopVideo = async () => {
        camera.stopRecording();
        setModalViewVideo(true);
        setDisableButtonGravar(false);


    }
    async function CloseVideo() {
        setModalViewVideo(false)
        setCamera(null)
    }
    async function CloseViewVideo() {
        onChange(dataVideo);
        setModalOpenVideo(false);
        closeCamera(false);
        setModalViewVideo(false)
    }

    /* Funções para Imagem*/
    async function takePicture() {
        if (camRef) {
            const data = await camRef.current.takePictureAsync();
            let fileInfo = await FileSystem.getInfoAsync(data.uri);
            console.log(fileInfo)
            setDataImagem(fileInfo)
            setCapturedPhoto(data.uri);
            setOpenModalReviewImage(true);
        }
    }
    async function savePicture() {
        onChange(dataImagem);
        setModalOpenCamera(false)
        closeCamera(false);
        setOpenModalReviewImage(false)
    }

    async function ClosePicture() {
        setOpenModalReviewImage(false)
    }
    async function functionTrocarCamera() {
        setModalOpenCamera(false);
        setModalOpenVideo(true);
    }
    /* Funções para Cronometro */
    const iniciar = async () => {
        if (timer !== null) {
            clearInterval(timer);
            timer = null;
        } else {
            timer = setInterval(() => {
                ss++
                let format = (ss < 10 ? '0' + ss : ss);
                setNumero(format);
                if (format == maxDuration) {
                    stopVideo();
                    reiniciar();
                }
            }, 1000)
        }
    }
    function reiniciar() {
        if (timer !== null) {
            clearInterval(timer);
            timer = null;
        }
        setUltimo(numero);
        setNumero(0);
        ss = 0;
        mm = 0;
        hh = 0;
    }

    const [modalOpenCamera, setModalOpenCamera] = React.useState({ ...openCamera });

    React.useEffect(() => {
        setModalOpenCamera(openCamera);
    }, [openCamera])


    /* Permissões para Camera*/
    if (hasCameraPermission === null || hasAudioPermission === null) {
        return <View />;
    }
    if (hasCameraPermission === false || hasAudioPermission === false) {
        return <Text>Acesso não permitido.</Text>;
    }


    return (
        <SafeAreaView style={{ flex: 1 }}>


            <Modal visible={modalOpenCamera}>
                <SafeAreaView style={styles.container}>
                    <Camera style={styles.camera} type={type} ref={camRef}>

                        <View style={styles.contentButtons}>
                            <TouchableOpacity
                                style={styles.buttonFlip}
                                onPress={() => {
                                    setType(
                                        type === Camera.Constants.Type.back
                                            ? Camera.Constants.Type.front
                                            : Camera.Constants.Type.back
                                    );
                                }}
                            >
                               <Icon name='swap' style={styles.buttonCameraChange} size={23} color="green" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.buttonCameraFoto} onPress={takePicture}>
                            <Icon name='camera'  size={23} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.buttonCameraClose} onPress={() => { setModalOpenCamera(false); closeCamera(false); }}>
                               <Icon name='closecircleo'  size={23} color="#fff" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.buttonCameraChangeVideo} onPress={() => { setModalOpenCamera(false); setModalOpenVideo(true); }}>
                                <Text>Gravar</Text>
                            </TouchableOpacity>

                        </View>
                    </Camera>
                    {capturedPhoto && (
                        <Modal animationType="slide" transparent={false} visible={openModalReviewImage}>
                            <View style={styles.contentModal}>
                                <Image style={styles.imgPhoto} source={{ uri: capturedPhoto }} />
                                <View style={styles.viewBotao}>
                                    <TouchableOpacity
                                        style={styles.ButtonCameraReview}
                                        onPress={() => ClosePicture()}>
                                        <Text>Voltar</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.ButtonCameraReview}
                                        onPress={() => savePicture()}>
                                        <Text>Salvar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>
                    )}
                </SafeAreaView>
            </Modal>



            <Modal visible={modalOpenVideo}>
                <SafeAreaView style={styles.container}>
                    <Camera
                        ref={ref => setCamera(ref)}
                        style={styles.camera}
                        type={type}
                        ratio={'4:3'} >
                        <View style={styles.cronArea}>
                            <Text style={styles.timer}>{numero}</Text>
                        </View>
                        <View style={styles.contentButtons} >
                            <TouchableOpacity
                                style={styles.buttonFlip}
                                onPress={() => {
                                    setType(
                                        type === Camera.Constants.Type.back
                                            ? Camera.Constants.Type.front
                                            : Camera.Constants.Type.back
                                    );
                                }}>
                              <Icon name='swap' style={styles.buttonCameraChange} size={23} color="green" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.buttonCameraClose} onPress={() => { setModalOpenVideo(false); closeCamera(false); }}>
                            <Icon name='closecircleo'  size={23} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.buttonCameraChangeVideo} onPress={() => { setModalOpenVideo(false); setModalOpenCamera(true); }}>
                                <Text>Foto</Text>
                            </TouchableOpacity>

                            {disableButtonGravar == false ?
                                <TouchableOpacity
                                    onPress={() => { takeVideo(); setDisableButtonGravar(true); iniciar() }}
                                    style={styles.buttonCameraVideo}>
                                    <Text style={styles.textButtonCamera}>Gravar</Text>
                                </TouchableOpacity>
                                :
                                <TouchableOpacity
                                    style={styles.buttonPause} onPress={() => { stopVideo(); reiniciar(); }}>
                                    <Text style={styles.textButtonCameraPause} >Pausar</Text>
                                </TouchableOpacity>
                            }

                        </View>
                    </Camera>
                    <Modal visible={modalViewVideo}>
                        <View style={styles.video}>
                            <Video
                                ref={video}
                                style={styles.video}
                                source={{
                                    uri: record,
                                }}

                                //useNativeControls
                                resizeMode="contain"
                                isLooping
                                onPlaybackStatusUpdate={status => setStatus(() => status)}
                            >
                            </Video>
                        </View>
                        <View style={styles.viewBotao}>
                            <TouchableOpacity
                                style={styles.ButtonCameraReview}
                                //title={status.isPlaying ? 'Pause' : 'Play'}
                                onPress={() =>
                                    status.isPlaying ? video.current.pauseAsync() : video.current.playAsync()
                                }
                            >
                                <Text style={styles.textButtonCamera}>{status.isPlaying ? 'Pause' : 'Play'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.ButtonCameraReview}
                                onPress={() => CloseVideo()}
                            >
                                <Text style={styles.textButtonCamera}>Voltar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.ButtonCameraReview}
                                onPress={() => CloseViewVideo()}
                            >
                                <Text style={styles.textButtonCamera}>Salvar</Text>
                            </TouchableOpacity>
                        </View>
                    </Modal>
                </SafeAreaView>

            </Modal >
        </SafeAreaView>

    );
}

const styles = StyleSheet.create({
    cameraContainer: {
        width: "100%",
        height: "100%",
    },
    buttonsInitial: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    ViewTitle: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontFamily: 'Montserrat_600SemiBold',
        fontSize: 20,
        color: '#8FC640',
        marginBottom: 10,
    },
    BtnView: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        justifyContent: 'center',
        margin: 15,
    },
    Btn: {
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        width: 100,
        height: 50,
        margin: 5,
    },
    fixedRatio: {
        flex: 1,
        aspectRatio: 1
    },
    video: {
        flex: 1,
        backgroundColor: '#F0F0F0',
        height: 70,

    },
    buttons: {

        backgroundColor: '#F0F0F0',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    buttonAction: {
        backgroundColor: "#F0F0F0",
    },

    container: {
        flex: 1,
        justifyContent: "center",
    },
    camera: {
        width: "100%",
        height: "100%",

    },
    contentButtons: {
        flex: 1,
        backgroundColor: "transparent",
        flexDirection: "row",
    },
    buttonFlip: {
        position: "absolute",
        bottom: 50,
        left: 30,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F0F0F0",
        margin: 20,
        height: 80,
        width: 80,
        borderRadius: 50,
    },
    buttonCameraChange: {

    },
    buttonCameraFoto: {
        position: "absolute",
        bottom: 30,
        right: 10,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: '#FF0000',
        margin: 35,
        height: 85,
        width: 85,
        borderRadius: 50,
    },
    buttonCameraVideo: {
        position: "absolute",
        bottom: 30,
        right: 10,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: '#FF0000',
        margin: 35,
        height: 85,
        width: 85,
        borderRadius: 50,
        borderWidth: 5,
        borderColor: '#ffff'
    },
    ButtonModalIncialView: {
        flex: 1,
        borderRadius: 10,
        width: 350,
        margin: 25,
        // background-color: #f0f0f0; /* #f0f0f0 */
        padding: 10,
        alignItems: 'center',
    },
    buttonPause: {
        position: "absolute",
        bottom: 30,
        right: 10,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#8FC640",
        margin: 35,
        height: 85,
        width: 85,
        borderRadius: 50,
    },
    textButtonCamera: {
        color: '#ffff',
    },
    textButtonCameraPause: {
        color: '#000',
    },
    buttonCameraClose: {
        // position: "absolute",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: '#F0F0F0',
        margin: 30,
        height: 50,
        width: 50,
        borderRadius: 80,
    },
    buttonCameraChangeVideo: {
        /*
        position: "absolute",
        right: 10,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: '#F0F0F0',
        margin: 30,
        height: 50,
        width: 50,
        borderRadius: 80,
        */
        position: "absolute",
        bottom: 180,
        left: 30,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F0F0F0",
        margin: 20,
        height: 70,
        width: 70,

        borderRadius: 50,
    },
    contentModal: {
        flex: 1,
        justifyContent: "center",
        alignItems: "flex-end",
        //margin: 20,
        backgroundColor: '#F0F0F0',
    },
    ButtonModalIncial: {
        //margin: 10,
        backgroundColor: '#C5915D',
        //flexDirection: 'row',
        //justifyContent: 'center',
        alignItems: 'center',
        //padding: 20,
        borderRadius: 50,
        flexDirection: 'row',
        justifyContent: 'space-around',
        margin: 15,
    },
    ButtonCameraReview: {
        margin: 10,
        backgroundColor: "red",
        backgroundColor: '#C5915D',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        borderRadius: 50
    },
    viewBotao: {
        backgroundColor: '#F0F0F0',
        margin: 10,
        flexDirection: 'row',
        justifyContent: "center",
        alignItems: "center",
    },
    imgPhoto: {
        width: "100%",
        height: 400,
    },
    buttonsCameraVideo: {
        position: "absolute",

        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "green",
        margin: 80,
        height: 80,
        width: 80,
        borderRadius: 50,

    },
    roundButton1: {
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        borderRadius: 100,
        backgroundColor: 'orange',
    },
    cronArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        bottom: 80,
    },
    timer: {
        marginTop: -160,
        fontSize: 45,
        fontWeight: 'bold',
        color: '#FFF',
    },
})
export default AppCameraVideo;
