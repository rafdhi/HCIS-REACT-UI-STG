import React, { Component } from "react";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";
import MUIDataTable from "mui-datatables-bitozen";
import FormAddressMD from './formAddressMD';
import API from '../../Services/Api';
import PopUp from '../../components/pages/PopUpAlert';
import * as R from 'ramda'
import M from 'moment';
import MasterDataAction from '../../Redux/MasterdataRedux';
import { connect } from 'react-redux';
import uuid from "uuid";

var ct = require("../../modules/custom/customTable");

class formAddressApplicant extends Component {
  constructor(props) {
    super(props)
    let { applicantData } = this.props

    this.state = {
      applicantData,
      typeAddress: "create",
      createVisible: false,
      editVisible: false,
      viewVisible: false,
      deletePopUpVisible: false,
      createFromAddressVisible: false,
      dataTableAddress: [],
      rawDataAddress: [],
      bizparAddressType: [],
      bizparNationality: [],
      countryStatus: [],
      provinceStatus: [],
      sendState: ""
    };
    this.handleDelete = this.handleDelete.bind(this);
  }


  openCreateAddressForm(type, selectedIndex = null) {
    let { createVisible, editVisible, viewVisible, openDeletePopup } = this.state
    let createPopUpVisible = this.state.createPopUpVisible ? !this.state.createPopUpVisible : false;
    switch (type) {
      case "create":
        this.setState({ createVisible: !createVisible, createPopUpVisible })
        break;
      case "edit":
        this.setState({ editVisible: !editVisible, createPopUpVisible, selectedIndex })
        break;
      case "view":
        this.setState({ viewVisible: !viewVisible, selectedIndex })
        break;
      case "delete":
        this.setState({ openDeletePopup: !openDeletePopup, selectedIndex })
        break;
      default:
        break;
    }
  }

  openSavePopUp = () => {
    if ((this.state.saveClass === "app-popup app-popup-show" && this.state.formApplicantDetailVisible) || (this.state.saveClass === "app-popup app-popup-show" && this.state.createClass === "app-popup app-popup-show")) {
      this.setState({
        dataTableAddress: [],
        saveClass: "app-popup",
        createClass: 'app-popup',
      });
    } else {
      this.setState({ saveClass: "app-popup app-popup-show" });
    }
  };

  openDeletePopup = (selectedIndex) => {
    this.setState({ deletePopUpVisible: !this.state.deletePopUpVisible, selectedIndex })
  }

  getMuiTheme = () => createMuiTheme(ct.customTable());

  options = ct.customOptions();

  componentDidMount() {
    this.props.getAddress({
      params: {
        refObjectID: this.state.applicantData.applicantNumber
      },
      offset: 0,
      limit: 5
    })
    this.getBizparNationality();
    this.getCountryStatus();
    // this.getProvinceByCountryID();
    this.getBizparAddressType();
  }

  async getBizparAddressType() {
    let payloadAddress = {
      params: {
        bizparCategory: "ADDRESS_TYPE"
      },
      offset: 0,
      limit: 10
    }
    API.create('BIZPAR').getBizparByCategory(payloadAddress).then(
      (res) => {
        if (res.status === 200) {
          console.log(res.data);
          if (res.data.status === 'S') {
            this.setState({
              bizparAddressType: res.data.data
            })
          }
        }
      })
  }

  async getCountryStatus() {
    let payloadCountry = {
      params: {
        "countryStatus": "ACTIVE"
      },
      offset: 0,
      limit: 200
    }
    API.create('MASTERDATA').getCountryMasterByCountryStatus(payloadCountry).then(
      (res) => {
        if (res.status === 200) {
          console.log(res.data);
          if (res.data.status === 'S') {
            this.setState({
              countryStatus: res.data.data
            })
          }
        }
      })
  }

  async getBizparNationality() {
    let payloadNationality = {
      params: {
        bizparCategory: "NATIONALITY_TYPE"
      },
      offset: 0,
      limit: 2
    }
    API.create('BIZPAR').getBizparByCategory(payloadNationality).then(
      (res) => {
        if (res.status === 200) {
          console.log(res.data);
          if (res.data.status === 'S') {
            this.setState({
              bizparNationality: res.data.data
            })
          }
        }
      }
    )
  }

  startFetch = () => {
    this.LoadingBar.continousStart();
  };

  onFinishFetch = () => {
    if (typeof this.LoadingBar === "object") this.LoadingBar.complete();
  };

  componentWillReceiveProps(newProps) {
    if (!newProps.masterdata.fetching && !R.isNil(newProps.masterdata.address)) {
      this.onFinishFetch()
      let dataTableAddress = newProps.masterdata.address.map((value, index) => {
        const { addressID, addressType, streetName } = value;
        return [
          addressID,
          addressType ? addressType.bizparValue : "",
          streetName
        ]
      })
      this.setState({
        dataTableAddress,
        rawDataAddress: newProps.masterdata.address
      })
    }

  }

  getAddressByRefObjectID() {
    let payloadAddreess = {
      params: {
        refObjectID: this.state.applicantData.applicantNumber
      },
      offset: 0,
      limit: 4
    }
    API.create('MASTERDATA').getAddressByRefObjectID(payloadAddreess).then(
      (res) => {
        if (res.status === 200) {
          if (res.data.status === 'S' && !R.isNil(res.data.data)) {
            return null
          }
        }
      })
  }

  async getProvinceByCountryID(value) {
    API.create('MASTERDATA').getProvinceByCountryID(value).then(
      (res) => {
        if (res.status === 200) {
          console.log(res.data);
          if (res.data.status === 'S') {
            this.setState({
              provinceStatus: res.data.data
            })
          }
        }
      })
  }

  postAddress(payload) {
    this.setState({ sendState: "loading" })
    payload = {
      ...payload,
      addressID: uuid.v1()
    }
    console.log('post ', payload);
    API.create('MASTERDATA').postAddress(payload).then(
      (res) => {
        if (res.status === 200) {
          if (res.data.status === 'S') {
            console.log(res.data)
            this.setState({ sendState: "finished" }, () => {
              setTimeout(() => {
                this.setState({ createPopUpVisible: true, dataTableAddress: [] })
              }, 500);
            })
            this.props.getAddress({
              params: {
                refObjectID: this.state.applicantData.applicantNumber
              },
              offset: 0,
              limit: 5
            })
          } else {
            alert('Failed: ' + res.data.message)
          }
        } else {
          console.log(res)
        }
      })
  }

  deleteAddress() {
    let payload = {
      referenceID: this.state.rawDataAddress[this.state.selectedIndex].addressID,
      requestBy: "SYSTEM",
      requestDate: M().format("DD-MM-YYYY HH:mm:ss")
    }

    API.create('MASTERDATA').deleteAddress(payload).then(
      (res) => {
        if (res.status === 200) {
          if (res.data.status === 'S') {
            console.log(res.data)
            this.setState({ deletePopUpVisible: !this.state.deletePopUpVisible })
            this.props.getAddress({
              params: {
                refObjectID: this.state.applicantData.applicantNumber
              },
              offset: 0,
              limit: 5
            })
          } else {
            alert('Failed: ' + res.data.message)
          }
        } else {
          console.log(res)
        }
      })
  }

  updateAddress(payload) {
    this.setState({ sendState: "loading" })
    API.create('MASTERDATA').updateAddress(payload).then(
      (res) => {
        if (res.status === 200) {
          if (res.data.status === 'S') {
            console.log(res.data)
            this.setState({ sendState: "finished" }, () => {
              setTimeout(() => {
                this.setState({ createPopUpVisible: true, dataTableAddress: [] })
              }, 500);
            })
            this.props.getAddress({
              params: {
                refObjectID: this.state.applicantData.applicantNumber
              },
              offset: 0,
              limit: 5
            })
          } else {
            alert('Failed: ' + res.data.message)
          }
        } else {
          console.log(res)
        }
      })
  }

  handleSubmit(value) {
    value.refObjectID = this.state.applicantData.applicantNumber;
    let payload = Object.assign({}, value);
    this.postAddress(payload);
  }

  handleDelete() {
    this.deleteAddress();
    this.props.backToPage()
  }

  handleChange(value) {
    let payload = Object.assign({}, value);
    this.updateAddress(payload);
  }

  handleAddress(index, tipe) {
    this.setState({
      selectedIndex: index,
      tipe
    })
    this.getProvinceByCountryID(this.state.rawDataAddress[index].country.countryID)
  }

  async getKabKot(value) {
    API.create('MASTERDATA').getKabKotByProvinceID(value).then(
      (res) => {
        if (res.status === 200) {
          console.log(res.data);
          if (res.data.status === 'S') {
            this.setState({
              kabKot: res.data.data
            })
            this.getKecamatan(this.state.rawDataAddress[this.state.selectedIndex].kabkot.kabkotID)
          }
        }
      })
  }

  async getKecamatan(value) {
    API.create('MASTERDATA').getKecamatanByKabKotID(value).then(
      (res) => {
        if (res.status === 200) {
          console.log(res.data);
          if (res.data.status === 'S') {
            this.setState({
              kec: res.data.data
            })
            this.getKelurahan(this.state.rawDataAddress[this.state.selectedIndex].kecamatan.kecamatanID)
          }
        }
      })
  }

  async getKelurahan(value) {
    API.create('MASTERDATA').getKelurahanByKecID(value).then(
      (res) => {
        if (res.status === 200) {
          console.log(res.data);
          if (res.data.status === 'S') {
            this.setState({
              kel: res.data.data
            })
            this.openCreateAddressForm(this.state.tipe, this.state.selectedIndex)
          }
        }
      })
  }

  async getProvinceByCountryID(value) {
    API.create('MASTERDATA').getProvinceByCountryID(value).then(
      (res) => {
        if (res.status === 200) {
          console.log(res.data);
          if (res.data.status === 'S') {
            this.setState({
              provinceStatus: res.data.data
            })
            this.getKabKot(this.state.rawDataAddress[this.state.selectedIndex].province.provinceID)
          }
        }
      })
  }

  columnsAddress = [
    "Address Number",
    "Type",
    "Address",
    {
      name: "Action",
      options: {
        customBodyRender: (val, tableMeta) => {
          return (
            this.props.type !== 'view' ?
              <div>
                <button
                  type="button"
                  className="btnAct"
                  style={{ marginRight: 15 }}
                  onClick={() => this.handleAddress(tableMeta.rowIndex, 'edit')}
                >
                  <i className="fa fa-pencil-alt" style={{ backgroundColor: 'transparent', color: '#004c97', fontSize: 20 }} />
                </button>
                <button
                  type="button"
                  className="btnAct"
                  style={{ marginRight: 15 }}
                  onClick={() => this.openDeletePopup(tableMeta.rowIndex)}
                >
                  <i className="fa fa-trash-alt" style={{ backgroundColor: 'transparent', color: 'red', fontSize: 20 }} />
                </button>
                <button
                  type="button"
                  className="btnAct"
                  onClick={() => this.handleAddress(tableMeta.rowIndex, 'view')}>
                  <i className="fa fa-ellipsis-v" style={{ backgroundColor: 'transparent', color: '#004c97', fontSize: 20 }} />
                </button>
              </div> :
              <button
                type="button"
                className="btnAct"
                onClick={() => this.handleAddress(tableMeta.rowIndex, 'view')}>
                <i className="fa fa-lw fa-ellipsis-v" style={{ backgroundColor: 'transparent', color: '#004c97', fontSize: 20 }} />
              </button>
          );
        }
      }
    }
  ];

  render() {
    let { selectedIndex } = this.state
    return (
      <div className="vertical-tab-content active" id="content-nav-3">
        <form action="#">
          <div className="border-bottom padding-10px  grid-mobile-none gap-20px">
            <div className="col-1 content-right margin-bottom-10px">
              {this.props.type !== 'view' ?
                <button
                  type="button"
                  className="btn btn-circle background-blue"
                  onClick={() => this.openCreateAddressForm("create")}
                >
                  <i className="fa fa-1x fa-plus" />
                </button>
                : null}
            </div>
            <MuiThemeProvider theme={this.getMuiTheme()}>
              <MUIDataTable
                title='Address'
                subtitle={'lorem ipsum dolor'}
                data={this.state.dataTableAddress}
                columns={this.columnsAddress}
                options={this.options}
              />
            </MuiThemeProvider>
          </div>

          {this.state.createVisible && (
            <FormAddressMD
              type={"create"}
              sendState={this.state.sendState}
              bizparAddressType={this.state.bizparAddressType}
              bizparNationality={this.state.bizparNationality}
              countryStatus={this.state.countryStatus}
              provinceStatus={this.state.provinceStatus}
              onClickSave={(value) => this.handleSubmit(value, "create")}
              onClickClose={() => this.openCreateAddressForm("create")}
            />
          )}
          {this.state.editVisible && (
            <FormAddressMD
              type={"update"}
              sendState={this.state.sendState}
              bizparAddressType={this.state.bizparAddressType}
              bizparNationality={this.state.bizparNationality}
              countryStatus={this.state.countryStatus}
              provinceStatus={this.state.provinceStatus}
              kabKot={this.state.kabKot}
              kec={this.state.kec}
              kel={this.state.kel}
              dataAddress={this.state.rawDataAddress[selectedIndex]}
              onClickSave={(value) => this.handleChange(value, "edit")}
              onClickClose={() => this.openCreateAddressForm("edit")} />
          )}
          {this.state.viewVisible && (
            <FormAddressMD
              type={"view"}
              bizparAddressType={this.state.bizparAddressType}
              bizparNationality={this.state.bizparNationality}
              countryStatus={this.state.countryStatus}
              provinceStatus={this.state.provinceStatus}
              kabKot={this.state.kabKot}
              kec={this.state.kec}
              kel={this.state.kel}
              dataAddress={this.state.rawDataAddress[selectedIndex]}
              onClickClose={() => this.openCreateAddressForm("view")}
            />
          )}

          {this.state.createPopUpVisible && (
            <PopUp
              type={"save"}
              class={"app-popup app-popup-show"}
              onClick={() => {
                this.setState({
                  createVisible: false,
                  editVisible: false,
                  createPopUpVisible: false,
                })
                this.props.backToPage()
              }}
            />
          )}

          {this.state.deletePopUpVisible && (
            <PopUp type={'delete'} class={"app-popup app-popup-show"}
              onClick={this.openDeletePopup.bind(this)}
              onClickDelete={this.handleDelete.bind(this)} />
          )}
        </form>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    masterdata: state.masterdata
  };
}

const mapDispatchToProps = dispatch => {
  return {
    getAddress: obj => dispatch(MasterDataAction.getAddress(obj))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(formAddressApplicant);