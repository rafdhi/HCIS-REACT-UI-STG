import React, { Component } from "react";

import M from "moment";
import DropDown from "../../../../../../modules/popup/DropDown";

import TablePayMethod from "../../../tables/confCorporateTPL/tablePayMethod";
import FormPayMethod from "./createPayMethod";
import * as R from 'ramda'

const defaultPayload = {
  cglobalPolicyID: "",
  cglobalPolicyValue: "",
  cglobalPolicyType: "",
  esid: "",
  cglobalPolicyStatus: "ACTIVE",
  cglobalPolicyCreationalDTO: {
    createdBy: "",
    createdDate: "",
    modifiedBy: null,
    modifiedDate: null
  }
};

class CreateGlobal extends Component {
  constructor(props) {
    super(props);
    let { bizparCorPolicyType, bizparTaxCalc, bizparSymbol, bizparPaymentMethod, bizparPaymentType } = this.props;
    this.state = {
      data: { ...defaultPayload, cglobalPolicyID: "CGP-" + M() },
      bizparCorPolicyType,
      bizparTaxCalc,
      bizparSymbol,
      bizparPaymentMethod,
      bizparPaymentType,
      createVibsible: false,
      savePopUpVisible: false,
      visiblePaymentDate: false,
      visiblePaymentMethod: false,
      visibleProrate: false,
      visibleAttendance: false,
      visibleTax: false,
      visibleRange: false,
      visibleUnpaid: false,
      dataTablePayment: [],
      day: "1",
      value1: "",
      value2: "",
      symbol1: "",
      symbol2: "",
    };
    this.day = Array.from(new Array(31), (val, index) => index + 1);
  }

  openSavePopUp = () => {
    this.setState({
      savePopUpVisible: !this.state.savePopUpVisible
    });
  };

  save() {
    return console.log(this.state.data);
  }

  openPopupPage() {
    let savePopUpVisible = this.state.savePopUpVisible
      ? !this.state.savePopUpVisible
      : false;
    this.setState({
      createVibsible: !this.state.createVibsible,
      savePopUpVisible
    });
  }

  componentDidMount() {
    console.log(JSON.stringify(this.props.bizparCorPolicyType));
    console.log(JSON.stringify(this.props.bizparSymbol));
    this.getDays()
  }

  getDays(){
    let days = this.day.map(day => {
      return {
        bizparKey: day,
        bizparValue: day
      };
    });
    this.setState({
      days:days
    })
  }

  selectSymbol(sym) {
    if (sym === "~") {
      this.setState({
        visibleRange: true,
        visibleAttendance: false
      });
    } else {
      this.setState({
        visibleRange: false,
        visibleAttendance: true
      });
    }
  }

  selectType(type) {
    if (type === "POLICYTYP-001") {
      this.setState({
        visiblePaymentDate: true,
        visiblePaymentMethod: false,
        visibleProrate: false,
        visibleAttendance: false,
        visibleTax: false,
        visibleRange: false,
        visibleUnpaid: false
      });
    } else if (type === "POLICYTYP-002") {
      this.setState({
        visiblePaymentDate: false,
        visiblePaymentMethod: true,
        visibleProrate: false,
        visibleAttendance: false,
        visibleTax: false,
        visibleRange: false,
        visibleUnpaid: false
      });
    } else if (type === "POLICYTYP-003") {
      this.setState({
        visiblePaymentMethod: false,
        visiblePaymentDate: false,
        visibleProrate: true,
        visibleAttendance: false,
        visibleTax: false,
        visibleRange: false,
        visibleUnpaid: false
      });
    } else if (type === "POLICYTYP-004") {
      this.setState({
        visiblePaymentMethod: false,
        visiblePaymentDate: false,
        visibleProrate: false,
        visibleAttendance: true,
        visibleTax: false,
        visibleRange: false,
        visibleUnpaid: false
      });
    } else if (type === "POLICYTYP-005") {
      this.setState({
        visiblePaymentMethod: false,
        visiblePaymentDate: false,
        visibleProrate: false,
        visibleAttendance: false,
        visibleTax: true,
        visibleRange: false,
        visibleUnpaid: false
      });
    } else if (type === 'POLICYTYP-006') {
      this.setState({
        visiblePaymentMethod: false,
        visiblePaymentDate: false,
        visibleProrate: false,
        visibleAttendance: false,
        visibleTax: false,
        visibleRange: false,
        visibleUnpaid: true
      });
    }
  }

  validation() {
    if (this.state.data.cglobalPolicyType === "POLICYTYP-004") {
      console.log(
        `${this.state.symbol1};${this.state.value1}-${this.state.value2}`,
        "dan",
        `${this.state.symbol1};${this.state.value1}#${this.state.symbol1};${this.state.value2}`
      );
      if (this.state.symbol1 === "~") {
        this.setState(
          {
            data: {
              ...this.state.data,
              cglobalPolicyValue: `${this.state.symbol1};${this.state.value1}-${this.state.value2}`
            }
          },
          () => this.props.onClickSave(this.state.data)
        );
      } else {
        this.setState(
          {
            data: {
              ...this.state.data,
              cglobalPolicyValue: `${this.state.symbol1};${this.state.value1}#${this.state.symbol2};${this.state.value2}`
            }
          },
          () => this.props.onClickSave(this.state.data)
        );
      }
    } else {
      this.props.onClickSave(this.state.data);
    }
  }

  handleSave = (dataPay) => {
    let { data } = this.state
    let array = Object.assign([], data.cglobalPolicyValue)
    let isExist = R.findIndex(R.propEq("id", dataPay.id))(array)
    if (isExist >= 0) array[isExist] = dataPay
    else array.push(dataPay) 
    this.setState({ data: { ...data, cglobalPolicyValue: array }, createVibsible: false })
  }

  handleDeletePayment = (value) => {
    let array = Object.assign([], this.state.data.cglobalPolicyValue)
    array.splice(value, 1)
    this.setState({ data: { ...this.state.data, cglobalPolicyValue: array }, createVibsible: false })
  }

  render() {
    let { data } = this.state;
    return (
      <div className="app-popup app-popup-show">
        <div className="padding-top-20px" />
        <div className="popup-content-small background-white border-radius">
          <form
            action="#"
            onSubmit={e => {
              e.preventDefault();
              if (R.isEmpty(this.state.data.cglobalPolicyType))
                return alert("Policy Type is Required.");
              if (R.isEmpty(this.state.data.cglobalPolicyValue) && this.state.visibleTax === true)
                return alert("Tax Calc Method is Required.");
              if (R.isEmpty(this.state.data.cglobalPolicyValue) && this.state.visiblePaymentDate === true)
                return alert("Payment Date is Required.");
              if (R.isEmpty(this.state.data.cglobalPolicyValue) && this.state.symbol1 === "" && this.state.visibleAttendance === true)
                return alert("Symbol is Required.");
              if (R.isEmpty(this.state.data.cglobalPolicyValue) && this.state.symbol2 === "" && this.state.visibleAttendance === true)
                return alert("Symbol is Required.");
              if (R.isEmpty(this.state.data.cglobalPolicyValue) && this.state.symbol1 === "" && this.state.visibleRange === true)
                return alert("Symbol is Required.");
              if (R.isEmpty(this.state.data.cglobalPolicyValue) && this.state.visiblePaymentMethod === true)
                return alert("Table data payment Method is Required .");
                this.validation()
            }}
          >
            <div className="popup-panel grid grid-2x">
              <div className="col-1">
                <div className="popup-title">
                  {"Corporate Global Policy - Create Form"}
                </div>
              </div>
              <div className="col-2 content-right">
                <button
                  className="btn btn-circle btn-grey"
                  onClick={this.props.onClickClose}
                >
                  <i className="fa fa-lg fa-times" />
                </button>
              </div>
            </div>

            <div className="display-flex-normal">
              <div className="padding-15px">
                <div className="margin-bottom-20px">
                  <div className="margin-5px">
                    <div className="txt-site txt-11 txt-main txt-bold">
                      <h4>
                        Policy ID <span style={{ color: "red" }}>*</span>
                      </h4>
                    </div>
                  </div>
                  <input
                    value={data.cglobalPolicyID}
                    style={{ backgroundColor: "#E6E6E6" }}
                    type="text"
                    readOnly
                    className="txt txt-sekunder-color"
                    placeholder={""}
                  />
                </div>

                <div className="margin-bottom-20px">
                  <div className="txt-site txt-11 txt-bold txt-main display-flex-normal">
                    <h4>
                      Policy Type <span style={{ color: "red" }}>*</span>
                    </h4>
                  </div>
                  <div className="margin-5px">
                    <DropDown
                      title="-- please select policy type --"
                      onChange={dt =>
                        this.setState(
                          {
                            data: {
                              ...this.state.data,
                              cglobalPolicyType: dt,
                              cglobalPolicyValue: ""
                            }
                          },
                          () => 
                          // console.log(dt)
                          this.selectType(dt)
                        )
                      }
                      data={this.state.bizparCorPolicyType}
                      type="bizpar"
                    />
                  </div>
                </div>

                {/* paymentDate */}
                {this.state.visiblePaymentDate && (
                  <div className="margin-bottom-20px">
                    <div className="txt-site txt-11 txt-bold txt-main display-flex-normal">
                      <h4>
                        Payment Date <span style={{ color: "red" }}>*</span>
                      </h4>
                    </div>
                    <div className="margin-5px">
                      <DropDown
                        title="-- please select date --"
                        onChange={dt =>
                          this.setState({
                            data: {
                              ...this.state.data,
                              cglobalPolicyValue: String(dt)
                            }
                          })
                        }
                        type="bizpar"
                        data={this.state.days}
                        value={data.cglobalPolicyValue}
                      />
                    </div>
                  </div>
                )}

                {/* paymentMethod */}
                {this.state.visiblePaymentMethod && (
                  <div>
                    <div className="col-1 content-right margin-bottom-10px">
                      <button
                        type="button"
                        className="btn btn-circle background-blue"
                        onClick={this.openPopupPage.bind(this)}
                      >
                        <i className="fa fa-1x fa-plus" />
                      </button>
                    </div>
                    {this.state.createVibsible && (
                      <FormPayMethod
                        type="create"
                        bizparSymbol={this.props.bizparSymbol}
                        bizparPaymentMethod={this.state.bizparPaymentMethod}
                        bizparPaymentType={this.state.bizparPaymentType}
                        onClickClose={this.openPopupPage.bind(this)}
                        onClickSave={this.handleSave.bind(this)}
                      />
                    )}
                    <div style={{ marginBottom: 20 }}>
                      <TablePayMethod
                        type={"create"}
                        visible={this.state.visiblePaymentMethod}
                        bizparSymbol={this.props.bizparSymbol}
                        bizparPaymentMethod={this.state.bizparPaymentMethod}
                        bizparPaymentType={this.state.bizparPaymentType}
                        onClickDelete={this.handleDeletePayment.bind(this)}
                        onClickClose={this.openPopupPage.bind(this)}
                        onClickSave={this.handleSave.bind(this)}
                        data={this.state.data}
                      />
                    </div>
                  </div>
                )}

                {/* prorate monthly */}
                {this.state.visibleProrate && (
                  <div className="margin-bottom-20px">
                    <div className="margin-5px">
                      <div className="txt-site txt-11 txt-main txt-bold">
                        <h4>
                          Prorate Monthly Factor{" "}
                          <span style={{ color: "red" }}>*</span>
                        </h4>
                      </div>
                    </div>
                    <input
                      value={data.cglobalPolicyValue}
                      onChange={e => {
                        this.setState({
                          data: {
                            ...data,
                            cglobalPolicyValue: e.target.value
                          }
                        });
                      }}
                      required
                      type="text"
                      className="txt txt-sekunder-color"
                      placeholder={""}
                    />
                  </div>
                )}

                {/* unpaidy */}
                {this.state.visibleUnpaid && (
                  <div className="margin-bottom-20px">
                    <div className="margin-5px">
                      <div className="txt-site txt-11 txt-main txt-bold">
                        <h4>
                          Value{" "}
                          <span style={{ color: "red" }}>*</span>
                        </h4>
                      </div>
                    </div>
                    <input
                      value={data.cglobalPolicyValue}
                      onChange={e => {
                        this.setState({
                          data: {
                            ...data,
                            cglobalPolicyValue: e.target.value
                          }
                        });
                      }}
                      required
                      type="text"
                      className="txt txt-sekunder-color"
                      placeholder={""}
                    />
                  </div>
                )}

                {/* attendance */}
                {this.state.visibleAttendance && (
                  <div>
                    <div className="margin-bottom-20px">
                      <div className="margin-5px">
                        <div className="txt-site txt-11 txt-main txt-bold">
                          <h4>
                            Month -1 Condition{" "}
                            <span style={{ color: "red" }}>*</span>
                          </h4>
                        </div>
                      </div>
                      <div className="grid grid-2x grid-mobile-none gap-10px">
                        <div className="column-1">
                          <DropDown
                            title="-- please select symbol --"
                            onChange={dt =>
                              this.setState(
                                {
                                  symbol1: dt
                                },
                                () => this.selectSymbol(dt)
                              )
                            }
                            value={this.state.symbol1}
                            data={this.state.bizparSymbol}
                            type="bizpar"
                          />
                        </div>
                        <div className="column-2">
                          <input
                            required
                            type="text"
                            className="txt txt-sekunder-color"
                            placeholder={""}
                            value={this.state.value1}
                            onChange={e => {
                              this.setState({
                                value1: e.target.value
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="margin-bottom-20px">
                      <div className="margin-5px">
                        <div className="txt-site txt-11 txt-main txt-bold">
                          <h4>
                            Current Month Condition{" "}
                            <span style={{ color: "red" }}>*</span>
                          </h4>
                        </div>
                      </div>
                      <div className="grid grid-2x grid-mobile-none gap-10px">
                        <div className="column-1">
                          <DropDown
                            title="-- please select symbol --"
                            onChange={dt =>
                              this.setState(
                                {
                                  symbol2: dt
                                },
                                () => this.selectSymbol(dt)
                              )
                            }
                            value={this.state.symbol2}
                            data={this.state.bizparSymbol}
                            type="bizpar"
                          />
                        </div>
                        <div className="column-2">
                          <input
                            required
                            value={this.state.value2}
                            onChange={e => {
                              this.setState({
                                value2: e.target.value
                              });
                            }}
                            type="text"
                            className="txt txt-sekunder-color"
                            placeholder={""}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* attendance range */}
                {this.state.visibleRange && (
                  <div className="grid grid-3x grid-mobile-none gap-10px">
                    <div className="column-1">
                      <div className="margin-bottom-20px ">
                        <div className="margin-5px">
                          <div className="txt-site txt-11 txt-main txt-bold">
                            <h4>
                              Month -1 Condition{" "}
                              <span style={{ color: "red" }}>*</span>
                            </h4>
                          </div>
                        </div>
                        <input
                          required
                          type="text"
                          className="txt txt-sekunder-color"
                          placeholder={""}
                          value={this.state.value1}
                          onChange={e => {
                            this.setState({
                              value1: e.target.value
                            });
                          }}
                        />
                      </div>
                    </div>
                    <div className="column-2">
                      <div className="margin-bottom-20px">
                        <div className="margin-5px">
                          <div className="txt-site txt-11 txt-bold txt-main display-flex-normal">
                            <h4>
                              Symbol <span style={{ color: "red" }}>*</span>
                            </h4>
                          </div>
                        </div>
                        <div className="margin-5px">
                          <DropDown
                            title="-- please select symbol --"
                            onChange={dt =>
                              this.setState(
                                {
                                  symbol1: dt
                                },
                                () => this.selectSymbol(dt)
                              )
                            }
                            data={this.state.bizparSymbol}
                            value={this.state.symbol1}
                            type="bizpar"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="column-3">
                      <div className="margin-bottom-20px ">
                        <div className="margin-5px">
                          <div className="txt-site txt-11 txt-main txt-bold">
                            <h4>
                              Current Month Condition{" "}
                              <span style={{ color: "red" }}>*</span>
                            </h4>
                          </div>
                        </div>
                        <input
                          required
                          type="text"
                          className="txt txt-sekunder-color"
                          placeholder={""}
                          value={this.state.value2}
                          onChange={e => {
                            this.setState({
                              value2: e.target.value
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* tax method*/}
                {this.state.visibleTax && (
                  <div className="margin-bottom-20px">
                    <div className="txt-site txt-11 txt-bold txt-main display-flex-normal">
                      <h4>
                        Tax Calc Method <span style={{ color: "red" }}>*</span>
                      </h4>
                    </div>
                    <div className="margin-5px">
                      <DropDown
                        title="-- please select tax calc --"
                        onChange={dt =>
                          this.setState({
                            data: {
                              ...this.state.data,
                              cglobalPolicyValue: dt
                            }
                          })
                        }
                        data={this.state.bizparTaxCalc}
                        type="bizpar"
                      />
                    </div>
                  </div>
                )}

                <div className="margin-bottom-20px">
                  <div className="txt-site txt-11 txt-bold txt-main display-flex-normal">
                    <h4>Activation</h4>
                  </div>
                  <div className="margin-15px">
                    <label className="radio">
                      <input
                        type="checkbox"
                        name="all-day"
                        checked={data.cglobalPolicyStatus}
                        disabled
                        onChange={e =>
                          this.setState({
                            data: {
                              ...this.state.data,
                              cglobalPolicyStatus: e.target.checked
                            }
                          })
                        }
                      />
                      <span className="checkmark" />
                      <span className="txt-site txt-11 txt-bold txt-main">
                        Activate Now
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-top padding-15px content-right">
              <button
                onClick={this.props.onClickClose}
                type="button"
                className="btn btn-primary margin-right-10px"
              >
                BACK
              </button>
              <button
                type="submit"
                className="btn btn-blue"
              >
                SAVE
              </button>
            </div>
          </form>
        </div>
        <div className="padding-bottom-20px" />
      </div>
    );
  }
}
export default CreateGlobal;
