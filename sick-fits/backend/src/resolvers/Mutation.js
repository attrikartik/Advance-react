const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const { hasPermission } = require('../utils')
const stripe = require('../stripe')
// const { transport, makeANiceEmail } = require('../mail');
// const { hasPermission } = require('../utils');
// const stripe = require('../stripe');

const Mutations = {
  async createItem(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to do that!');
    }

    const item = await ctx.db.mutation.createItem(
      {
        data: {
          // This is how to create a relationship between the Item and the User
          user: {
            connect: {
              id: ctx.request.userId,
            },
          },
          ...args,
        },
      },
      info
    );


    return item;
  },
    async updateItem(parent, args, ctx, info){
        // copy of updates
        const updates = { ...args }
        // remove ID from updates
        delete updates.id
        // update logic
          return await ctx.db.mutation.updateItem({
              data: updates,
              where: { id: args.id }
          }, info)
    },
    async deleteItem(parent, args, ctx, info){
        // which item to delete
        const where = { id: args.id }

        // find item
   
        const item = await ctx.db.query.item({where},`{id,title,user{id}}`)

        // check if they own that item, or have permission
            const ownsItem = item.user.id === ctx.request.userId
            const hasPermissions = ctx.request.user.permissions.some(permission=>
               ['ADMIN','ITEMDELETE'].includes(permission)
              )
            if( !ownsItem && !hasPermission ){
              throw new Error('Permission denied')
            }
        // delete it
        return ctx.db.mutation.deleteItem({where},info)
    },

    async signup(parent, args, ctx, info){
       // lowerCase the email
       args.email = args.email.toLowerCase()
       // password hashing
       const hashedPassword = await bcrypt.hash(args.password,12)
       // create user in DB
       const user = await ctx.db.mutation.createUser({
           data:{
               ...args,
               password: hashedPassword,
               permissions: { set: ['USER']},
           },
       },info)

       // create JWT token for users
       const token =  jwt.sign({
           userId: user.id
       }, process.env.APP_SECRET)
       // we set jwt as cookie on response
       ctx.response.cookie('token', token,{
           httpOnly: true,
           maxAge: 1000 * 60 * 60 + 24 * 365 // one year
       })
       // return user 
       return user
    },

    async signin(parent, {email,password}, ctx, info){
        // check if user with email exits
        const user = await ctx.db.query.user({where:{email:email}})
         if(!user){
             throw new Error("No such email exits")
         }

         // check password
         const valid = await bcrypt.compare(password,user.password)
         if(!valid){
            throw new Error("Invalid Password")
         }
         const token =  jwt.sign({
            userId: user.id
        }, process.env.APP_SECRET)
        // we set jwt as cookie on response
        ctx.response.cookie('token', token,{
            httpOnly: true,
            maxAge: 1000 * 60 * 60 + 24 * 365 // one year
        })
        // return user 
        return user
     },

     signout(parent, args, ctx, info){
         ctx.response.clearCookie('token')
         return { message: 'Logout Successful!!'}
     },

    async  requestReset(parent, args, ctx, info){
         // 1. Check if this is a real user
    const user = await ctx.db.query.user({ where: { email: args.email } });
    if (!user) {
      throw new Error(`No such user found for email ${args.email}`);
    }
    // 2. Set a reset token and expiry on that user
    const randomBytesPromiseified = promisify(randomBytes);
    const resetToken = (await randomBytesPromiseified(20)).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry },
    });
    // 3. Email them that reset token
    // const mailRes = await transport.sendMail({
    //   from: 'wes@wesbos.com',
    //   to: user.email,
    //   subject: 'Your Password Reset Token',
    //   html: makeANiceEmail(`Your Password Reset Token is here!
    //   \n\n
    //   <a href="${process.env
    //     .FRONTEND_URL}/reset?resetToken=${resetToken}">Click Here to Reset</a>`),
    // });

    },
    async resetPassword(parent, args, ctx, info) {
        //  check if the passwords match
        if (args.password !== args.confirmPassword) {
          throw new Error("Passwords don't match!");
        }
        //  check if its a legit reset token
        //  Check if its expired
        const [user] = await ctx.db.query.users({
          where: {
            resetToken: args.resetToken,
            resetTokenExpiry_gte: Date.now() - 3600000,
          },
        });
        if (!user) {
          throw new Error('This token is either invalid or expired!');
        }
        //  Hash their new password
        const password = await bcrypt.hash(args.password, 12);
        //  Save the new password to the user and remove old resetToken fields
        const updatedUser = await ctx.db.mutation.updateUser({
          where: { email: user.email },
          data: {
            password,
            resetToken: null,
            resetTokenExpiry: null,
          },
        });
        //  Generate JWT
        const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
        //  Set the JWT cookie
        ctx.response.cookie('token', token, {
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24 * 365,
        });
        //  return the new user
        return updatedUser;
      },
      
      async updatePermissions(parent,args,ctx,info){
          // check if user is logged in
          if(!ctx.request.userId) {
            throw new Error('Please logg in')
          }
          // query the user
          const currentUser = await ctx.db.query.user({where:{id: ctx.request.userId}},info)
          // check if they have permissions
             hasPermission(currentUser,['ADMIN','PERMISSIONUPDATE'])
          // update the permissions
          return ctx.db.mutation.updateUser({
            data: {
              permissions: {
                set: args.permissions
              }
            },
            where: {
              id: args.userId
            }
          },info)
      },

      async addToCart(parent,args,ctx,info){
        // check is user is logged in
        const { userId } = ctx.request
        if(!userId) {
          throw new Error('Please logg in')
        }
        // query cuurent user's cart
        const [existingCartItem] = await  ctx.db.query.cartItems({
            where:{
              user: {id: userId},
              item: {id: args.id}
            }
        })
         // if item exits increment the count
        if (existingCartItem) {
          console.log('This item is already in their cart');
          return ctx.db.mutation.updateCartItem(
            {
              where: { id: existingCartItem.id },
              data: { quantity: existingCartItem.quantity + 1 },
            },
            info
          );
        }
         // if not present create new item
         return ctx.db.mutation.createCartItem({
           data:{
             user: {
               connect:{ id: userId}
             },
             item:{
               connect: {id: args.id }
             }
           }
         },info)
      },

      async removeFromCart( parent,args,ctx,info){
          // find the cart item
          const cartItem = await ctx.db.query.cartItem({
            where: {
              id: args.id
            }
          }, `{ id, user {id} }`)
          if(!cartItem){
            throw new Error ('No item Found')
          }
          // make sure they own that cart items
           if( cartItem.user.id !== ctx.request.userId){
             throw new Error ('Please Logg In')
           }
          // delete that cart item
          return ctx.db.mutation.deleteCartItem({
            where: {
              id: args.id
            }
          }, info)
      },

      async createOrder (parent,args,ctx,info){
        // query the current user, make sure they are logged in 
        const {userId} = ctx.request
         if(!userId){
           throw new Error ("pleae Logg In!!")
         }
        const user = await ctx.db.query.user(
          { where: { id: userId} },
         `{
            id
            name
            email
            cart {
              id
              quantity
              item { id title price description image largeImage}
            }
          }`
          )
        // re-calculate the total price 
        const amount = user.cart.reduce(
          (tally,cartItem) => tally + cartItem.item.price * cartItem.quantity, 0 )
        console.log(`Going to charge total amount ${amount}`)
        // create stripe charge
        // const charge = await stripe.charges.create({
        //   amount,
        //   currency: 'USD',
        //   source: args.token,
        // });
        // const charge = await stripe.paymentIntents.create({
        //   description: 'Software development services',
        //   shipping: {
        //   name: 'Jenny Rosen',
        //   address: {
        //     line1: '510 Townsend St',
        //     postal_code: '98140',
        //     city: 'San Francisco',
        //     state: 'CA',
        //     country: 'US',
        //   },
        //   },
        //   amount: amount,
        //   currency: 'USD',
        //   payment_method_types: ['card'],
        // })
        
        // convert cartItems to OrderItems
        const orderItems = user.cart.map(cartItem =>{
          const orderItem={
            ...cartItem.item,
            quantity: cartItem.quantity,
            user: {connect:{ id: userId}}
          }
          delete orderItem.id
          return orderItem
        })
         
        // create the order
        const order = await ctx.db.mutation.createOrder({
          data: {
            total: amount,
            items: { create: orderItems},
            charge: 'charge_Stripe',
            user: { connect: {id: userId}}
          }
        })
        // clean up the user cart after order placed, delete cartItems
        const cartItemIds = user.cart.map(cartItem => cartItem.id)
        await ctx.db.mutation.deleteManyCartItems({
          where:{
            id_in: cartItemIds
          }
        })
        // return order to client
        return order
      }
};

module.exports = Mutations;
