import { Vue, Component } from 'vue-property-decorator';

@Component({
  template: `
    <div class='home-page'>
      <button @click='addUser'> Add User</button>
      <div v-for='user in users' :key='user._id'>
        {{user._id}}
      </div>
    </div>
  `
})
export default class HomePage extends Vue {
  addUser () {
    this.$store.dispatch('addUser');
  }
  get users () {
    return this.$store.state.users;
  }
}